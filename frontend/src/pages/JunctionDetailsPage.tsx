import { useParams } from 'react-router-dom';

function JunctionDetailsPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Junction Details</h1>
      <p>Junction ID: {id}</p>
    </div>
  );
}

export default JunctionDetailsPage;