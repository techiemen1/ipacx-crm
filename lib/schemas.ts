
// ... existing schemas ...

import { z } from "zod"

// ... keep existing schemas (user, customer, project, property, inventory) ...

export const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "ARCHITECT", "SALES", "STAFF"]),
    designation: z.string().optional(),
    phone: z.string().optional(),
})

export const customerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    status: z.enum(["Lead", "Prospect", "Customer"]),
    projectInterest: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional(),
    pan: z.string().optional(),
})

export const invoiceItemSchema = z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
    taxRate: z.coerce.number().min(0).default(0),
    amount: z.coerce.number().min(0), // Calculated
    // Tax Splits
    hsnCode: z.string().optional(),
    cgstAmount: z.coerce.number().default(0),
    sgstAmount: z.coerce.number().default(0),
    igstAmount: z.coerce.number().default(0),
    cessAmount: z.coerce.number().default(0)
})

export const invoiceSchema = z.object({
    invoiceNo: z.string().min(1, "Invoice number is required"),
    customerId: z.string().min(1, "Customer is required"),
    companyProfileId: z.string().optional(),
    type: z.enum(["INVOICE", "PROFORMA"]).default("INVOICE"),
    amount: z.coerce.number().min(0), // Subtotal
    taxRate: z.coerce.number().default(0), // Global tax (deprecated mostly)
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    status: z.enum(["Pending", "Paid", "Overdue", "Draft", "Partial"]),
    invoiceItems: z.array(invoiceItemSchema).optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),

    // Statutory & Compliance
    placeOfSupply: z.string().optional(),
    gstin: z.string().optional(),
    tdsAmount: z.coerce.number().default(0),
    tcsAmount: z.coerce.number().default(0),

    // Transport
    transportMode: z.string().optional(),
    vehicleNo: z.string().optional(),
    distance: z.coerce.number().optional(),
    transporterId: z.string().optional()
})

export const vendorSchema = z.object({
    name: z.string().min(2, "Vendor name is required"),
    category: z.string().min(2, "Category is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    gstin: z.string().optional(),
    address: z.string().optional(),
})

export const expenseSchema = z.object({
    title: z.string().min(2, "Title is required"),
    amount: z.coerce.number().min(1, "Amount must be positive"),
    category: z.string().min(2, "Category is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    vendorId: z.string().optional(),
    projectId: z.string().optional(),
    description: z.string().optional(),
    paymentMethod: z.string().optional(),
})

export const paymentSchema = z.object({
    invoiceId: z.string().min(1, "Invoice is required"),
    amount: z.coerce.number().min(1, "Amount must be positive"),
    date: z.string().default(() => new Date().toISOString()),
    method: z.string().min(1, "Payment method is required"),
    reference: z.string().optional(),
    notes: z.string().optional(),
})

// Export Types
export type UserFormValues = z.infer<typeof userSchema>
export type CustomerFormValues = z.infer<typeof customerSchema>
export type InvoiceFormValues = z.infer<typeof invoiceSchema>
export type VendorFormValues = z.infer<typeof vendorSchema>
export type ExpenseFormValues = z.infer<typeof expenseSchema>
export type PaymentFormValues = z.infer<typeof paymentSchema>
export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>
export type ProjectFormValues = z.infer<typeof projectSchema>
export type PropertyFormValues = z.infer<typeof propertySchema>

// Add other missing schemas if needed during implementation
export const propertySchema = z.object({
    name: z.string().min(1),
    projectId: z.string().min(1),
    type: z.string(),
    size: z.string(),
    price: z.coerce.number(),
    status: z.string(),
    features: z.string().optional()
})

export const projectSchema = z.object({
    name: z.string().min(1),
    location: z.string(),
    type: z.string(),
    status: z.string()
})

export const inventoryItemSchema = z.object({
    name: z.string().min(1),
    category: z.string(),
    unit: z.string(),
    minLevel: z.coerce.number(),
    barcode: z.string().optional()
})

export const companyProfileSchema = z.object({
    name: z.string().min(2, "Company Name is required"),
    address: z.string(),
    country: z.string(),
    currency: z.string(),
    timezone: z.string(),
    gstin: z.string(),
    pan: z.string(),
    email: z.union([z.string().email(), z.literal("")]),
    phone: z.string(),
    website: z.string(),
    isDefault: z.boolean()
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>
