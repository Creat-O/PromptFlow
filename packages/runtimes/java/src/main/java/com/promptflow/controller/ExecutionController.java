package com.promptflow.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/execute")
public class ExecutionController {
    @PostMapping
     public Map<String, Object> execute(@RequestBody Map<String, Object> body) {
        long t0 = System.currentTimeMillis();
        String id = body.get("id").toString();
        String prompt = body.get("prompt").toString();

        String output = "[JAVA processed] " + prompt.toUpperCase();

        long latency = System.currentTimeMillis() - t0;
        return Map.of(
            "id", id,
            "output", output,
            "latency", latency
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("ok", true);
    }
}
