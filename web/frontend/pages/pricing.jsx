import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../shadcn/ui/card"
import { Button } from "../shadcn/ui/button"
import { Badge } from "../shadcn/ui/badge"
import { Separator } from "../shadcn/ui/separator"

export default function Pricing() {
  const [plans, setPlans] = useState([])

  useEffect(() => {
  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/pricing")
      console.log("Raw response:", res)

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()

      setPlans(data)
    } catch (err) {
      console.error("Failed to fetch pricing:", err)
    }
  }

  fetchPlans()
}, [])


  return (
    <div className="py-12 px-6">
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-muted-foreground">Choose the plan that fits your store size</p>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className="flex flex-col border border-muted rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                  {Number(plan.price) === 0 ? (
                    <Badge variant="secondary">Starter</Badge>
                  ) : (
                    <Badge variant="default">Most Popular</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold">
                  {Number(plan.price) > 0
                    ? `$${Number(plan.price).toFixed(2)}/${plan.interval}`
                    : "Free"}
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="flex-grow p-6">
                {plan.description && (
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside text-left">
                    {plan.description
                      .split("\n")
                      .map((line, index) => {
                        const cleanLine = line.replace(/^->\s*/, "")
                        return cleanLine ? <li key={index}>{cleanLine}</li> : null
                      })}
                  </ul>
                )}
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button className="w-full">Select {plan.name}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}