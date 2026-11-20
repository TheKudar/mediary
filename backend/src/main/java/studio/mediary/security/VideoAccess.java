package studio.mediary.security;

import com.fasterxml.jackson.databind.JsonNode;

public class VideoAccess {

    private VideoAccess() {}

    public static boolean canWatch(JsonNode clip, String viewer) {
        if (clip.path("owner").asText().equals(viewer)
                || clip.path("privacy").asText().equals("Публичное")) return true;
        if (clip.path("privacy").asText().equals("По приглашению"))
            for (var invited : clip.path("invites"))
                if (invited.asText().equals(viewer)) return true;
        return false;
    }
}
