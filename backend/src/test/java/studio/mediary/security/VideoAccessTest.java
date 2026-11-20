package studio.mediary.security;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.junit.jupiter.api.Test;

class VideoAccessTest {
    private final ObjectNode clip = new ObjectMapper().createObjectNode().put("owner", "author");

    @Test
    void privateVideosBelongToTheirOwnerEvenWithOldInvites() {
        clip.put("privacy", "Приватное").putArray("invites").add("friend");
        assertTrue(VideoAccess.canWatch(clip, "author"));
        assertFalse(VideoAccess.canWatch(clip, "friend"));
    }

    @Test
    void invitationsGiveAccessOnlyToNamedViewers() {
        clip.put("privacy", "По приглашению").putArray("invites").add("friend");
        assertTrue(VideoAccess.canWatch(clip, "friend"));
        assertFalse(VideoAccess.canWatch(clip, "guest"));
    }

    @Test
    void publicVideosAreAvailableToGuests() {
        clip.put("privacy", "Публичное");
        assertTrue(VideoAccess.canWatch(clip, "guest"));
    }
}
