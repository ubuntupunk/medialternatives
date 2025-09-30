export async function GET() {
  // Temporarily return simple health check to test search functionality
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Basic health check - monitoring disabled for testing'
  });
}