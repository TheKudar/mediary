package studio.mediary.dto;

import java.util.List;

public record Registration(String name, String email, String password, List<String> interests) {}
