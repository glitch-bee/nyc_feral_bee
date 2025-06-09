export function createMarkerForm() {
  const formContainer = document.getElementById('marker-form')
  if (!formContainer) return
  // Placeholder form. Replace with actual form elements.
  const form = document.createElement('form')
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Marker name'
  form.appendChild(input)
  formContainer.appendChild(form)
}
