"""Vercel-compatible notification stub.

Server-Sent Events require long-lived connections which aren't
supported on Vercel serverless. The frontend polls instead.
"""


class NotificationManager:
    async def publish(self, location_id: str, event: str, data: dict):
        pass


notification_manager = NotificationManager()
