import { supabase, getSupabaseBucket, isSupabaseReady } from '@/lib/supabaseClient';

export { isSupabaseReady };

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const normalizeBucket = (bucket) => {
  if (!bucket) return '';
  return String(bucket).trim().replace(/^\/+|\/+$/g, '');
};

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
  const status = error?.statusCode || error?.status;
  const normalized = message.toLowerCase();

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Falha de conexao com o Supabase Storage. Verifique sua internet e o URL do projeto.';
  }
  if (message.includes('row-level security')) {
    return 'Permissao negada no Storage. Verifique as politicas de RLS do bucket.';
  }
  if (status === 404 || (normalized.includes('bucket') && normalized.includes('not found'))) {
    return 'Bucket do Storage nao encontrado. Verifique o nome configurado em VITE_SUPABASE_BUCKET.';
  }
  if (status === 403 || normalized.includes('permission denied')) {
    return 'Permissao negada no Storage. Verifique as politicas de acesso do bucket.';
  }
  if (message.includes('JWT')) {
    return 'Chave anon invalida ou expirada. Verifique as credenciais do Supabase.';
  }
  return message;
};

export const uploadImageFile = async ({ file, folder }) => {
  if (!supabase) {
    throw new Error('Supabase nao configurado.');
  }

  const bucket = normalizeBucket(getSupabaseBucket());
  if (!bucket) {
    throw new Error('Bucket do Storage nao configurado.');
  }

  const fileName = safeFileName(file.name || 'imagem');
  const path = `${folder}/${uniqueSuffix()}-${fileName}`;
  const contentType = file.type || 'application/octet-stream';

  const { error: uploadError } = await withTimeout(
    supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    }),
    20000,
    'Tempo limite no upload. Verifique as politicas do Storage e sua conexao.'
  );

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

  const bucket = normalizeBucket(getSupabaseBucket());
  if (!bucket) {
    throw new Error('Bucket do Storage nao configurado.');
  }

  const { error } = await withTimeout(
    supabase.storage.from(bucket).remove(paths),
    15000,
    'Tempo limite ao remover arquivos do Storage.'
  );

  if (error) {
    throw new Error(formatStorageError(error, 'Falha ao remover arquivos do storage.'));
  }
};
