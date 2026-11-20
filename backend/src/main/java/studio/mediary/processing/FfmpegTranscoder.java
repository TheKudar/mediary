package studio.mediary.processing;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class FfmpegTranscoder {
    private static final Duration TIME_LIMIT = Duration.ofHours(1);

    public void encode480p(Path source, Path destination) throws IOException, InterruptedException {
        Process process =
                new ProcessBuilder(
                                "ffmpeg",
                                "-nostdin",
                                "-y",
                                "-loglevel",
                                "error",
                                "-i",
                                source.toString(),
                                "-map",
                                "0:v:0",
                                "-map",
                                "0:a?",
                                "-vf",
                                "scale=-2:min(480\\,ih)",
                                "-c:v",
                                "libx264",
                                "-pix_fmt",
                                "yuv420p",
                                "-threads",
                                "2",
                                "-c:a",
                                "aac",
                                "-movflags",
                                "+faststart",
                                destination.toString())
                        .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                        .redirectError(ProcessBuilder.Redirect.INHERIT)
                        .start();
        try {
            if (!process.waitFor(TIME_LIMIT.toSeconds(), TimeUnit.SECONDS))
                throw new IOException("Video conversion timed out");
            if (process.exitValue() != 0)
                throw new IOException("FFmpeg exit code " + process.exitValue());
        } finally {
            if (process.isAlive()) {
                process.destroyForcibly();
                process.waitFor();
            }
        }
    }
}
