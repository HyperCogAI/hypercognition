-- Activate all pending agents so they can receive real-time price updates
UPDATE agents 
SET status = 'active' 
WHERE status = 'pending';