"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function TestConnectionPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Backend Health Check", status: "pending", message: "Not tested" },
    { name: "API Base URL", status: "pending", message: "Not tested" },
    { name: "Meals Endpoint", status: "pending", message: "Not tested" },
    { name: "Auth Endpoint", status: "pending", message: "Not tested" },
    { name: "CORS Configuration", status: "pending", message: "Not tested" },
  ])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const updateTest = (index: number, status: TestResult["status"], message: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ))
  }

  const runTests = async () => {
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: "pending", message: "Testing..." })))

    // Test 1: Backend Health Check
    try {
      const response = await fetch("http://localhost:5000/")
      if (response.ok) {
        const data = await response.json()
        updateTest(0, "success", `Backend is running: ${data.message}`, data)
      } else {
        updateTest(0, "error", `Backend returned status: ${response.status}`)
      }
    } catch (error) {
      updateTest(0, "error", `Cannot connect to backend: ${error}`)
    }

    // Test 2: API Base URL
    try {
      updateTest(1, "success", `API Base URL: ${API_BASE_URL}`)
    } catch (error) {
      updateTest(1, "error", `API Base URL error: ${error}`)
    }

    // Test 3: Meals Endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/meals`)
      if (response.ok) {
        const data = await response.json()
        updateTest(2, "success", `Meals endpoint working. Found ${data.count} meals`, data)
      } else {
        updateTest(2, "error", `Meals endpoint returned status: ${response.status}`)
      }
    } catch (error) {
      updateTest(2, "error", `Meals endpoint error: ${error}`)
    }

    // Test 4: Auth Endpoint (should return 401 for unauthenticated request)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`)
      if (response.status === 401) {
        updateTest(3, "success", "Auth endpoint working (correctly returns 401 for unauthenticated request)")
      } else {
        updateTest(3, "error", `Auth endpoint returned unexpected status: ${response.status}`)
      }
    } catch (error) {
      updateTest(3, "error", `Auth endpoint error: ${error}`)
    }

    // Test 5: CORS Configuration
    try {
      const response = await fetch(`${API_BASE_URL}/meals`)
      const corsHeader = response.headers.get('Access-Control-Allow-Origin')
      if (corsHeader) {
        updateTest(4, "success", `CORS configured: ${corsHeader}`)
      } else {
        updateTest(4, "error", "CORS headers not found")
      }
    } catch (error) {
      updateTest(4, "error", `CORS test error: ${error}`)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Frontend-Backend Integration Test</h1>
          <p className="text-gray-600">
            This page tests the connection between the MealMate frontend and backend services.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Configuration</CardTitle>
            <CardDescription>Current API configuration settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Frontend URL:</strong> http://localhost:3000</p>
              <p><strong>Backend URL:</strong> http://localhost:5000</p>
              <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Integration Tests</CardTitle>
            <CardDescription>Click the button below to run all integration tests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} className="mb-6">
              Run All Tests
            </Button>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">View Response Data</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {tests.filter(t => t.status === "success").length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {tests.filter(t => t.status === "error").length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {tests.filter(t => t.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
