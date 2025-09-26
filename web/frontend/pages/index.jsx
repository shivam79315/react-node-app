import { Card, CardContent, CardHeader, CardTitle } from "../shadcn/ui/card"
import { Button } from "../shadcn/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn/ui/tabs"

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">2 hours ago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">5,432</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-red-500">3 Issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Settings */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Auto-sync new products
                </label>
                <Button variant="outline">Enable</Button>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Default Shipping Profile
                </label>
                <select className="border rounded p-2 w-full">
                  <option>Standard Shipping</option>
                  <option>Express Shipping</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email Alerts</span>
                <Button variant="outline">Toggle</Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Slack Integration</span>
                <Button variant="outline">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}