// Fill supabaseConfig.json with your project URL and anon key.
// {
//   "url": "https://xxxxx.supabase.co",
//   "anonKey": "public-anon-key"
// }

let supabaseClient = null;
let supabaseConfig = null;

async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!supabaseConfig) {
    const res = await fetch('supabase/supabaseConfig.json', { cache: 'no-store' });
    supabaseConfig = await res.json();
  }
  const { createClient } = window.supabase;
  supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  return supabaseClient;
}

export async function fetchGallery() {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addGalleryItem(item) {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('gallery_items').insert({
    type: item.type,
    storage_url: item.src,
    alt: item.alt || null
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function clearGallery() {
  const supabase = await initSupabase();
  const { error } = await supabase.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export async function fetchPolls() {
  const supabase = await initSupabase();
  const { data: polls, error: e1 } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
  if (e1) throw e1;
  const ids = polls.map(p => p.id);
  const { data: options, error: e2 } = await supabase.from('poll_options').select('*').in('poll_id', ids);
  if (e2) throw e2;
  const byPoll = options.reduce((m, o) => { (m[o.poll_id] ||= []).push(o); return m; }, {});
  return polls.map(p => ({ ...p, options: (byPoll[p.id] || []).map(o => ({ id: o.id, text: o.text, votes: o.votes_count })) }));
}

export async function createPoll(question, options) {
  const supabase = await initSupabase();
  const { data: poll, error: e1 } = await supabase.from('polls').insert({ question }).select('*').single();
  if (e1) throw e1;
  const rows = options.map(text => ({ poll_id: poll.id, text }));
  const { error: e2 } = await supabase.from('poll_options').insert(rows);
  if (e2) throw e2;
  return poll.id;
}

export async function vote(pollId, optionId) {
  const supabase = await initSupabase();
  const { error } = await supabase.rpc('vote', { p_poll_id: pollId, p_option_id: optionId });
  if (error) throw error;
} 