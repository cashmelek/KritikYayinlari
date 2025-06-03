// Supabase Yapılandırma Dosyası (Localhost)

// Supabase istemcisini global olarak tanımla
if (typeof supabaseClient === 'undefined') {
  // Localhost için Supabase URL ve ANON KEY
  const SUPABASE_URL = 'https://kyqtdtyubmipiwjrudgc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cXRkdHl1Ym1pcGl3anJ1ZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODAwODEsImV4cCI6MjA2MzY1NjA4MX0.PiF7N1hPFGFfO_5fg_C640Z3YzsABaqtKfSoMTJ5Kow';
    
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase Localhost bağlantısı kuruldu');
}
