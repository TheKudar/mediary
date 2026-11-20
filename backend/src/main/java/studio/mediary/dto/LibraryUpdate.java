package studio.mediary.dto;

import com.fasterxml.jackson.databind.node.ObjectNode;

public record LibraryUpdate(String name, long version, ObjectNode doc) {}
