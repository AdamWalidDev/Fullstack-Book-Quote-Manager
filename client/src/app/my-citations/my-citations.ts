import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CitationService, Citation } from "../services/citations.service";
import { forkJoin } from "rxjs";
import { hue, initials } from "../shared/display";

const DEFAULT_QUOTES = [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
    { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
];

@Component({
    selector: 'app-my-citations',
    imports: [FormsModule],
    templateUrl: './my-citations.html',
    styles: ``,
})
export class Citations implements OnInit {
    private citationService = inject(CitationService);

    citations = signal<Citation[]>([]);
    error = signal('');
    loading = signal(false);
    listLoading = signal(true);
    removingId = signal<number | null>(null);

    readonly initials = initials;
    readonly hue = hue;

    // Form fields
    text = '';
    author = '';
    editId: number | null = null;

    get isEdit() {
        return this.editId !== null;
    }

    ngOnInit() {
        this.loadCitations();
    }

    loadCitations() {
        this.citationService.getAll().subscribe({
            next: (data) => {
                if (data.length === 0) {
                    this.seedDefaults();
                } else {
                    this.citations.set(data);
                    this.listLoading.set(false);
                }
            },
            error: (err) => {
                this.listLoading.set(false);
                this.error.set(err.status === 401 ? 'Your session has expired — please sign in again.' : 'Failed to load quotes.');
            },
        });
    }

    private seedDefaults() {
        const requests = DEFAULT_QUOTES.map(q => this.citationService.create(q));
        forkJoin(requests).subscribe({
            next: (created) => {
                this.citations.set(created);
                this.listLoading.set(false);
            },
            error: () => {
                this.listLoading.set(false);
                this.error.set('Failed to seed default quotes.');
            },
        });
    }

    startEdit(citation: Citation) {
        this.editId = citation.id;
        this.text = citation.text;
        this.author = citation.author;
        // Bring the form into view on small screens
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEdit() {
        this.editId = null;
        this.text = '';
        this.author = '';
    }

    onSubmit() {
        this.error.set('');
        this.loading.set(true);

        const body = { text: this.text, author: this.author };

        const request = this.isEdit
            ? this.citationService.update(this.editId!, body)
            : this.citationService.create(body);

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.cancelEdit();
                this.loadCitations();
            },
            error: () => {
                this.loading.set(false);
                this.error.set('Failed to save quote.');
            },
        });
    }

    deleteCitation(id: number) {
        if (!confirm('Delete this quote? This cannot be undone.')) return;
        this.removingId.set(id);
        this.citationService.delete(id).subscribe({
            next: () => {
                // Let the fade-out animation finish before removing the card
                setTimeout(() => {
                    this.citations.update((list) => list.filter((c) => c.id !== id));
                    this.removingId.set(null);
                    if (this.editId === id) this.cancelEdit();
                }, 250);
            },
            error: () => {
                this.removingId.set(null);
                this.error.set('Failed to delete quote.');
            },
        });
    }
}
