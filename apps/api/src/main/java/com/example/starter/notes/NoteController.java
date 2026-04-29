package com.example.starter.notes;

import java.util.List;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

  private final NoteRepository noteRepository;

  public NoteController(NoteRepository noteRepository) {
    this.noteRepository = noteRepository;
  }

  @GetMapping
  public List<Note> list() {
    return noteRepository.findAllByOrderByCreatedAtDesc();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Note create(@Valid @RequestBody NoteRequest request) {
    return noteRepository.save(new Note(request.getTitle(), request.getBody()));
  }
}
