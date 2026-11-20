package studio.mediary.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.springframework.stereotype.Component;

@Component
public class LibraryDocuments {
    private final ObjectMapper json;

    LibraryDocuments(ObjectMapper json) {
        this.json = json;
    }

    public ObjectNode read(String text) {
        try {
            return (ObjectNode) json.readTree(text);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
