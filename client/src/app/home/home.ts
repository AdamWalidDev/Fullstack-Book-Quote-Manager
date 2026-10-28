import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookService, Book } from '../services/book.service';
import { describeHttpError } from '../services/http-error';
import { hue, initials } from '../shared/display';

@Component({
  selector: 'app-home',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './home.html',
  styles: ``,
})
export class Home implements OnInit {
  private bookService = inject(BookService);

  books = signal<Book[]>([]);
  loading = signal(true);
  error = signal('');
  query = signal('');
  removingId = signal<number | null>(null);

  readonly skeletonRows = [0, 1, 2, 3];
  readonly initials = initials;
  readonly hue = hue;

  // Books matching the search box
  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.books();
    return this.books().filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  });

  // Dashboard stats
  authorCount = computed(() => new Set(this.books().map((b) => b.author.trim().toLowerCase())).size);
  latestYear = computed(() => {
    const years = this.books()
      .map((b) => new Date(b.publishedDate).getFullYear())
      .filter((y) => !isNaN(y));
    return years.length ? Math.max(...years) : null;
  });

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getAll().subscribe({
      next: (data) => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 401
            ? 'Your session has expired — please sign in again.'
            : describeHttpError(err, 'Failed to load books.')
        );
      },
    });
  }

  deleteBook(book: Book) {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    this.removingId.set(book.id);
    this.bookService.delete(book.id).subscribe({
      next: () => {
        // Let the fade-out animation finish before removing the row
        setTimeout(() => {
          this.books.update((list) => list.filter((b) => b.id !== book.id));
          this.removingId.set(null);
        }, 250);
      },
      error: () => {
        this.removingId.set(null);
        this.error.set('Failed to delete book.');
      },
    });
  }
}
