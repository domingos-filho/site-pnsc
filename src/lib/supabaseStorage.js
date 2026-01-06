import { supabase, getSupabaseBucket, isSupabaseReady } from '@/lib/supabaseClient';

export { isSupabaseReady };

const safeFileName = (fileName) =>
  fileName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');

const uniqueSuffix = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatStorageError = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  const message = error?.message || String(error);
  if (message.includes('row-level security')) {
    return 'Permissão negada no Storage. Verifique as políticas de RLS do bucket.';
  }
  if (message.toLowerCase().includes('bucket') && message.toLowerCase().includes('not found')) {
    return 'Bucket do Storage não encontrado. Verifique o nome configurado em VITE_SUPABASE_BUCKET.';
  }
  if (message.toLowerCase().includes('permission denied')) {
    return 'Permissão negada no Storage. Verifique as políticas de acesso do bucket.';
  }
  if (message.includes('JWT')) {
    return 'Chave anon inválida ou expirada. Verifique as credenciais do Supabase.';
  }
  return message;
};

export const uploadImageFile = async ({ file, folder }) => {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const bucket = getSupabaseBucket();
  const fileName = safeFileName(file.name || 'imagem');
  const path = `${folder}/${uniqueSuffix()}-${fileName}`;
  const contentType = file.type || 'application/octet-stream';

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType });

  if (uploadError) {
    throw new Error(formatStorageError(uploadError, 'Falha ao enviar a imagem.'));
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    publicUrl: data.publicUrl,
    path,
  };
};

export const deleteStoragePaths = async (paths) => {
  if (!supabase || !paths || paths.length === 0) {
    return;
  }

  const bucket = getSupabaseBucket();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(formatStorageError(error, 'Falha ao remover arquivos do storage.'));
  }
};
