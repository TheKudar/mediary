package studio.mediary.processing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import studio.mediary.repository.VideoJobRepository.Job;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import studio.mediary.repository.VideoJobRepository;
import studio.mediary.storage.MediaFiles;

@Component
@ConditionalOnProperty(name = "media.worker", havingValue = "true")
public class VideoProcessor {
    private static final Logger log = LoggerFactory.getLogger(VideoProcessor.class);
    private final VideoJobRepository jobs;
    private final FfmpegTranscoder transcoder;
    private final MediaFiles files;
    private final TransactionTemplate transactions;

    public VideoProcessor(
            VideoJobRepository jobs,
            FfmpegTranscoder transcoder,
            MediaFiles files,
            TransactionTemplate transactions) {
        this.jobs = jobs;
        this.transcoder = transcoder;
        this.files = files;
        this.transactions = transactions;
    }

    @Scheduled(fixedDelay = 3000)
    public void processNext() {
        jobs.claimNext().ifPresent(this::process);
    }

    private void process(Job job) {
        Path temporary = files.temporary(job.assetId(), job.claim());
        try {
            if (!job.deleteFiles()) transcoder.encode480p(files.original(job.assetId()), temporary);
            transactions.executeWithoutResult(status -> finish(job, temporary));
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        } catch (IOException | UncheckedIOException failure) {
            log.warn("Could not process asset {}", job.assetId(), failure);
            jobs.complete(job, false);
        } finally {
            try {
                Files.deleteIfExists(temporary);
            } catch (IOException failure) {
                log.warn("Could not remove {}", temporary, failure);
            }
        }
    }

    private void finish(Job job, Path temporary) {
        if (!jobs.lockClaim(job)) return;
        try {
            if (job.deleteFiles()) {
                files.delete(job.assetId());
                jobs.delete(job);
            } else {
                files.publish(job.assetId(), temporary);
                jobs.complete(job, true);
            }
        } catch (IOException failure) {
            throw new UncheckedIOException(failure);
        }
    }
}
