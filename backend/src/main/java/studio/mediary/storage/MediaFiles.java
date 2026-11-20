package studio.mediary.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class MediaFiles {
    private final Path directory;

    public MediaFiles(@Value("${media.directory:/media}") Path directory) {
        this.directory = directory;
    }

    public Path original(long id) {
        return directory.resolve(Long.toString(id));
    }

    public Path rendition(long id) {
        return directory.resolve(id + ".480.mp4");
    }

    public Path temporary(long id, UUID claim) {
        return directory.resolve(id + "." + claim + ".working.mp4");
    }

    public void store(long id, org.springframework.web.multipart.MultipartFile upload) throws IOException {
        Files.createDirectories(directory);
        upload.transferTo(original(id));
    }

    public void publish(long id, Path temporary) throws IOException {
        Files.move(
                temporary,
                rendition(id),
                StandardCopyOption.REPLACE_EXISTING,
                StandardCopyOption.ATOMIC_MOVE);
    }

    public void delete(long id) throws IOException {
        Files.deleteIfExists(original(id));
        Files.deleteIfExists(rendition(id));
        try (var abandoned = Files.newDirectoryStream(directory, id + ".*.working.mp4")) {
            for (Path path : abandoned) Files.deleteIfExists(path);
        }
    }
}
