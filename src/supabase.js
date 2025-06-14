import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xgjlhtvbfgrwjfpekixb.supabase.co',  // <-- paste your Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamxodHZiZmdyd2pmcGVraXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODMyNjUsImV4cCI6MjA2NDk1OTI2NX0.Ceh2RvOBmN8NNxdt07zFx6Nox1qyaHzSTKxtqef_qCw'                   // <-- paste your anon public key
);

// Helper functions for marker operations
export async function addMarker(markerData) {
  const { data, error } = await supabase
    .from('markers')
    .insert([{
      lat: markerData.lat,
      lng: markerData.lng,
      type: markerData.type,
      notes: markerData.notes,
      timestamp: new Date().toISOString(),
      // photo_url: markerData.photo_url, // for future use
      // user_id: markerData.user_id, // for future use
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding marker:', error)
    throw error
  }

  return data
}

export async function getAllMarkers() {
  const { data, error } = await supabase
    .from('markers')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching markers:', error)
    throw error
  }

  return data || []
}

export async function deleteMarker(markerId) {
  const { error } = await supabase
    .from('markers')
    .delete()
    .eq('id', markerId)

  if (error) {
    console.error('Error deleting marker:', error)
    throw error
  }

  return true
}

export async function updateMarker(markerId, updates) {
  const { data, error } = await supabase
    .from('markers')
    .update(updates)
    .eq('id', markerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating marker:', error)
    throw error
  }

  return data
}

// Comment-related functions
export async function addComment(markerId, commentText, authorName = 'Anonymous') {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      marker_id: markerId,
      comment_text: commentText,
      author_name: authorName,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    throw error
  }

  return data
}

export async function getComments(markerId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('marker_id', markerId)
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    throw error
  }

  return data || []
}
