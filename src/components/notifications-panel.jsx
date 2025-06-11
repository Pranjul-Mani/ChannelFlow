const NotificationsPanel = ({ notifications }) => {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border p-4">
      <h4 className="font-medium text-gray-900 mb-3">Recent Notifications</h4>
      <div className="space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <div key={notification.id} className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50">
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                notification.type === "warning"
                  ? "bg-yellow-500"
                  : notification.type === "success"
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
            ></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationsPanel
