// Single point of truth for which storage backend is active.
// Swap `jsonRepository` for a future `supabaseRepository` here — nothing
// else in the app imports from lib/data/jsonRepository.ts directly.
import { jsonRepository } from "./jsonRepository";

export const db = jsonRepository;
