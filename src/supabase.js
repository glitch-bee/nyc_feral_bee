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
      status: markerData.status || 'Unverified',
      photo_url: markerData.photo_url || null,
      timestamp: new Date().toISOString(),
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

// Update marker status specifically
export async function updateMarkerStatus(markerId, status) {
  return updateMarker(markerId, { 
    status: status,
    timestamp: new Date().toISOString() // Update timestamp when status changes
  })
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

// Photo upload functions
export async function uploadPhoto(file) {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = fileName

  // Upload file to storage
  const { data, error } = await supabase.storage
    .from('bee-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading photo:', error)
    throw error
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('bee-photos')
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: urlData.publicUrl
  }
}

export async function deletePhoto(photoPath) {
  const { error } = await supabase.storage
    .from('bee-photos')
    .remove([photoPath])

  if (error) {
    console.error('Error deleting photo:', error)
    throw error
  }

  return true
}
