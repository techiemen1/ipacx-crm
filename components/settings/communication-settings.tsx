"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function CommunicationSettings() {
    const handleSave = () => {
        toast.success("Settings saved successfully")
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Email Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Email Configuration</CardTitle>
                        <CardDescription>Configure SMTP or API for sending emails.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select defaultValue="smtp">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smtp">SMTP</SelectItem>
                                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                                    <SelectItem value="aws-ses">AWS SES</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Host / API Key</Label>
                            <Input placeholder="smtp.example.com or API Key" type="password" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Port</Label>
                                <Input placeholder="587" />
                            </div>
                            <div className="space-y-2">
                                <Label>Secure</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch />
                                    <span className="text-sm text-muted-foreground">SSL/TLS</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>From Email</Label>
                            <Input placeholder="notifications@company.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>From Name</Label>
                            <Input placeholder="Company Name" />
                        </div>
                        <Button onClick={handleSave} className="w-full">Save Email Settings</Button>
                    </CardContent>
                </Card>

                {/* WhatsApp Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>WhatsApp API</CardTitle>
                        <CardDescription>Configure Meta Business API for WhatsApp.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Phone Number ID</Label>
                            <Input placeholder="10928..." />
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp Business Account ID</Label>
                            <Input placeholder="10192..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Access Token</Label>
                            <Input placeholder="EAAG..." type="password" />
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">Save WhatsApp Config</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SMS Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>SMS Gateway</CardTitle>
                        <CardDescription>Configure provider for OTPs and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select defaultValue="twilio">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="twilio">Twilio</SelectItem>
                                    <SelectItem value="msg91">MSG91</SelectItem>
                                    <SelectItem value="textlocal">TextLocal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account SID / Username</Label>
                            <Input placeholder="SID..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Auth Token / API Key</Label>
                            <Input placeholder="Token..." type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sender ID</Label>
                            <Input placeholder="MyCorp" />
                        </div>
                        <Button onClick={handleSave} className="w-full">Save SMS Settings</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
