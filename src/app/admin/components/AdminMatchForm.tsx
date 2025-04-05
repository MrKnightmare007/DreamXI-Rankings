// ... existing code ...

// In your handleDeleteParticipation function
// Make sure your participation object has an id property
async function handleDeleteParticipation(participationId: string) {
  console.log("Attempting to delete participation with ID:", participationId); // Add this debug line
  
  // Add validation to ensure ID exists
  if (!participationId) {
    console.error("Cannot delete participation: ID is undefined");
    setError("Cannot delete participation: Missing ID");
    return;
  }

  try {
    const response = await fetch(`/api/admin/participations/${participationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete participation');
    }

    // Success handling
    setSuccess('Participation deleted successfully');
    // Refresh the data
    fetchMatchDetails();
  } catch (error) {
    console.error('Error deleting participation:', error);
    setError(error.message || 'Failed to delete participation');
  }
}

// In your JSX where the delete button is rendered
{match?.participations?.map((participation) => (
  <tr key={participation.id}>
    {/* Other table cells */}
    <td className="px-4 py-2">
      <button
        onClick={() => {
          console.log("Delete button clicked for participation:", participation); // Add this debug line
          handleDeleteParticipation(participation.id);
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Delete
      </button>
    </td>
  </tr>
))}

// ... existing code ...