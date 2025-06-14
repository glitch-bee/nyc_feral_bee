import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to embedded keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xgjlhtvbfgrwjfpekixb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamxodHZiZmdyd2pmcGVraXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODMyNjUsImV4cCI6MjA2NDk1OTI2NX0.Ceh2RvOBmN8NNxdt07zFx6Nox1qyaHzSTKxtqef_qCw'

export const supabase = createClient(supabaseUrl, supabaseKey);

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
    .eq('id', markerId) // Keep markerId as string (UUID)

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
    .eq('id', markerId) // Keep markerId as string (UUID)
    .select()
    .single()

  if (error) {
    console.error('Error updating marker:', error)
    throw error
  }

  return data
}

export async function updateMarkerStatus(markerId, status) {
  return updateMarker(markerId, { // Keep markerId as string (UUID)
    status: status,
    timestamp: new Date().toISOString() // Update timestamp when status changes
  })
}

// Comment-related functions
export async function addComment(markerId, commentText, authorName = 'Anonymous') {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      marker_id: markerId, // Keep markerId as string (UUID)
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
    .eq('marker_id', markerId) // Keep markerId as string (UUID)
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
