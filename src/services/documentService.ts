import { supabase, type Document } from '../lib/supabase';

export const documentService = {
  async createDocument(title: string = 'Untitled Document') {
    const { data, error } = await supabase
      .from('documents')
      .insert({ title, content: '' })
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  },

  async getDocument(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Document | null;
  },

  async updateDocument(id: string, content: string) {
    const { error } = await supabase
      .from('documents')
      .update({ content })
      .eq('id', id);

    if (error) throw error;
  },

  async updateDocumentTitle(id: string, title: string) {
    const { error } = await supabase
      .from('documents')
      .update({ title })
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToDocument(documentId: string, callback: (document: Document) => void) {
    const channel = supabase
      .channel(`document:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          callback(payload.new as Document);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
