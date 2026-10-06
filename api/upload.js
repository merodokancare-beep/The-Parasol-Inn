import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { verifyAdmin } from './_db.js';

let ffmpegPath = null;
try {
  const mod = await import('ffmpeg-static');
  ffmpegPath = mod.default || mod;
} catch (e) {
  if (fs.existsSync('/usr/bin/ffmpeg')) {
    ffmpegPath = '/usr/bin/ffmpeg';
  } else if (fs.existsSync('/usr/local/bin/ffmpeg')) {
    ffmpegPath = '/usr/local/bin/ffmpeg';
  } else {
    ffmpegPath = 'ffmpeg';
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Optimizes a video using ffmpeg:
 * - Codec: H.264 (libx264) with CRF 23 for crisp high visual quality with low bitrate
 * - Resolution: Intelligent bounds check (max 1920x1080 landscape, max 1080x1920 portrait)
 * - Frame rate: Capped at 30fps
 * - Audio: AAC 128kbps stereo
 * - FastStart: Places MOOV atom at start for instant streaming in web browsers
 */
function optimizeVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
      return reject(new Error('FFmpeg binary not found on server.'));
    }

    // Unified filter for landscape or portrait, keeping aspect ratio and ensuring even pixel dimensions
    const vf = "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))',scale=trunc(iw/2)*2:trunc(ih/2)*2";

    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'fast',
      '-vf', vf,
      '-r', '30',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-movflags', '+faststart',
      outputPath
    ];

    const proc = spawn(ffmpegPath, args);
    let errLogs = '';

    proc.stderr.on('data', chunk => {
      errLogs += chunk.toString();
    });

    proc.on('close', code => {
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${errLogs.slice(-300)}`));
      }
    });

    proc.on('error', err => {
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin authorization check
  const isAuthorized = await verifyAdmin(req);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized admin access.' });
  }

  if (method === 'POST') {
    try {
      const { file, fileName, folder = 'videos' } = req.body || {};

      if (!file) {
        return res.status(400).json({ error: 'No file data received.' });
      }

      // Check if file is data URI or raw base64
      let base64Data = file;
      let mimeType = '';
      const dataUriMatch = file.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/s);
      if (dataUriMatch) {
        mimeType = dataUriMatch[1];
        base64Data = dataUriMatch[2];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const MAX_SIZE = 85 * 1024 * 1024; // 85 MB limit
      if (buffer.length > MAX_SIZE) {
        return res.status(413).json({ error: 'File size exceeds maximum allowed limit (85MB).' });
      }

      // Determine extension
      let ext = path.extname(fileName || '').toLowerCase();
      if (!ext) {
        if (mimeType.includes('mp4')) ext = '.mp4';
        else if (mimeType.includes('webm')) ext = '.webm';
        else if (mimeType.includes('ogg')) ext = '.ogg';
        else if (mimeType.includes('quicktime')) ext = '.mov';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
        else if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        else ext = '.mp4';
      }

      // Validate allowed extensions
      const allowedExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.jpg', '.jpeg', '.png', '.webp'];
      if (!allowedExts.includes(ext)) {
        return res.status(400).json({ error: `Unsupported file format (${ext}). Allowed formats: MP4, WebM, OGG, MOV.` });
      }

      const safeFolder = folder === 'images' ? 'images' : 'videos';
      const uploadsDir = path.join(__dirname, '..', 'uploads', safeFolder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const rawBase = path.basename(fileName || 'guest_review', ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
      const isVideo = safeFolder === 'videos' && ['.mp4', '.webm', '.mov', '.ogg', '.m4v'].includes(ext);

      // If it's a video, write raw file and run optimization pipeline
      if (isVideo) {
        const rawFileName = `${rawBase || 'review'}_raw_${Date.now()}${ext}`;
        const rawPath = path.join(uploadsDir, rawFileName);
        await fs.promises.writeFile(rawPath, buffer);

        const optFileName = `${rawBase || 'review'}_opt_${Date.now()}.mp4`;
        const optPath = path.join(uploadsDir, optFileName);

        try {
          const t0 = Date.now();
          await optimizeVideo(rawPath, optPath);
          const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

          const origSize = buffer.length;
          const optSize = fs.statSync(optPath).size;
          const savedPercent = Math.max(0, Math.round((1 - (optSize / origSize)) * 100));

          // Cleanup raw video
          if (fs.existsSync(rawPath)) {
            await fs.promises.unlink(rawPath);
          }

          const publicUrl = `/uploads/${safeFolder}/${optFileName}`;
          return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: optFileName,
            originalSize: origSize,
            optimizedSize: optSize,
            savedPercent: savedPercent,
            elapsedSeconds: elapsed,
            message: `Video successfully optimized! High 1080p visual quality preserved (${savedPercent}% size reduction in ${elapsed}s).`
          });
        } catch (optErr) {
          console.warn('Video optimization notice, falling back to original upload:', optErr.message);
          // Fallback: Rename raw file to clean standard file
          const standardFileName = `${rawBase || 'review'}_${Date.now()}${ext}`;
          const standardPath = path.join(uploadsDir, standardFileName);
          if (fs.existsSync(rawPath)) {
            await fs.promises.rename(rawPath, standardPath);
          }
          const publicUrl = `/uploads/${safeFolder}/${standardFileName}`;
          return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: standardFileName,
            size: buffer.length,
            message: 'Video uploaded successfully (standard encoding).'
          });
        }
      }

      // Non-video files (images)
      const uniqueName = `${rawBase || 'asset'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeFolder}/${uniqueName}`;
      return res.status(200).json({
        success: true,
        url: publicUrl,
        fileName: uniqueName,
        size: buffer.length,
        message: 'File uploaded successfully.'
      });
    } catch (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: err.message || 'File upload failed.' });
    }
  }

  if (method === 'DELETE') {
    try {
      const fileParam = req.query.file || (req.body && req.body.file);
      if (!fileParam) {
        return res.status(400).json({ error: 'File parameter is required.' });
      }

      // Prevent directory traversal
      const normalized = path.normalize(fileParam).replace(/^(\.\.(\/|\\|$))+/, '');
      const cleanPath = normalized.replace(/^\/?uploads\/?/, '');
      const absoluteTarget = path.join(__dirname, '..', 'uploads', cleanPath);

      if (fs.existsSync(absoluteTarget)) {
        await fs.promises.unlink(absoluteTarget);
        return res.status(200).json({ success: true, message: 'File removed successfully.' });
      }
      return res.status(404).json({ error: 'File not found on server.' });
    } catch (err) {
      console.error('File delete error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed.' });
}
