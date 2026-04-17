<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content glass-card animate-fade-in-up" id="add-book-modal">
          <div class="modal-header">
            <h2 class="modal-title">{{ isAddingChapter ? 'Add Chapter' : 'Add New Book' }}</h2>
            <button class="btn btn-ghost btn-icon" @click="$emit('close')" id="close-modal-btn">
              ✕
            </button>
          </div>

          <!-- Add Book Form -->
          <form v-if="!isAddingChapter" @submit.prevent="handleAddBook" class="modal-form">
            <div class="form-group">
              <label for="book-title" class="form-label">Title</label>
              <input
                id="book-title"
                v-model="bookForm.title"
                type="text"
                placeholder="Enter book title"
                required
              />
            </div>

            <div class="form-group">
              <label for="book-author" class="form-label">Author (optional)</label>
              <input
                id="book-author"
                v-model="bookForm.author"
                type="text"
                placeholder="Enter author name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Quick start with text</label>
              <textarea
                id="book-text"
                v-model="bookForm.initialText"
                placeholder="Paste your text here to create a book with a single chapter..."
                rows="6"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Or upload a file</label>
              <div class="file-upload" @click="fileInput?.click()">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".txt,.md,.pdf"
                  style="display: none"
                  @change="handleFileUpload"
                />
                <span class="file-upload-icon">📄</span>
                <span class="file-upload-text">
                  {{ uploadedFileName || 'Click to upload .txt, .md, or .pdf file' }}
                </span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                id="submit-book-btn"
                :disabled="!bookForm.title || isParsing"
              >
                {{ isParsing ? 'Parsing PDF...' : 'Create Book' }}
              </button>
            </div>
          </form>

          <!-- Add Chapter Form -->
          <form v-else @submit.prevent="handleAddChapter" class="modal-form">
            <div class="form-group">
              <label for="chapter-title" class="form-label">Chapter Title</label>
              <input
                id="chapter-title"
                v-model="chapterForm.title"
                type="text"
                placeholder="Enter chapter title"
                required
              />
            </div>

            <div class="form-group">
              <label for="chapter-content" class="form-label">Content</label>
              <textarea
                id="chapter-content"
                v-model="chapterForm.content"
                placeholder="Paste the chapter text here..."
                rows="10"
                required
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                id="submit-chapter-btn"
                :disabled="!chapterForm.title || !chapterForm.content || isParsing"
              >
                {{ isParsing ? 'Parsing PDF...' : 'Add Chapter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (process.client) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const props = defineProps<{
  show: boolean;
  isAddingChapter?: boolean;
  bookId?: string;
}>();

const emit = defineEmits<{
  close: [];
  addBook: [data: { title: string; author?: string; initialText?: string }];
  addChapter: [data: { title: string; content: string }];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFileName = ref('');
const isParsing = ref(false);

const bookForm = reactive({
  title: '',
  author: '',
  initialText: '',
});

const chapterForm = reactive({
  title: '',
  content: '',
});

function handleAddBook() {
  emit('addBook', {
    title: bookForm.title,
    author: bookForm.author || undefined,
    initialText: bookForm.initialText || undefined,
  });
  resetForms();
}

function handleAddChapter() {
  emit('addChapter', {
    title: chapterForm.title,
    content: chapterForm.content,
  });
  resetForms();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploadedFileName.value = file.name;

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    await parsePdf(file);
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (props.isAddingChapter) {
        chapterForm.content = text;
      } else {
        bookForm.initialText = text;
        // Auto-fill title if empty
        if (!bookForm.title) {
          bookForm.title = file.name.replace(/\.[^/.]+$/, '');
        }
      }
    };
    reader.readAsText(file);
  }
}

async function parsePdf(file: File) {
  isParsing.value = true;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    if (props.isAddingChapter) {
      chapterForm.content = fullText;
    } else {
      bookForm.initialText = fullText;
      if (!bookForm.title) {
        bookForm.title = file.name.replace(/\.[^/.]+$/, '');
      }
    }
  } catch (err) {
    console.error('Error parsing PDF:', err);
    alert('Failed to parse PDF file. It might be encrypted or corrupted.');
  } finally {
    isParsing.value = false;
  }
}

function resetForms() {
  bookForm.title = '';
  bookForm.author = '';
  bookForm.initialText = '';
  chapterForm.title = '';
  chapterForm.content = '';
  uploadedFileName.value = '';
}

watch(
  () => props.show,
  (val) => {
    if (!val) resetForms();
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: var(--space-4);
}

.modal-content {
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.file-upload {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-upload:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-glass);
}

.file-upload-icon {
  font-size: 1.5rem;
}

.file-upload-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  animation: fadeInUp var(--transition-slow) ease-out;
}
</style>
