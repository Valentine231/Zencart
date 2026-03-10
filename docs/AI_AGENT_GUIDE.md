# ZenCart AI Agent System

## Overview

The ZenCart chatbot has been upgraded to an **intelligent AI agent** that can autonomously execute complex shopping tasks. The agent uses advanced tool-calling capabilities to search products, manage orders, provide recommendations, and handle customer interactions.

## Features

### 🛍️ Customer AI Agent

#### Product Management
- **Search Products** - Find products by query, category, or price range
- **Browse Categories** - Explore products by category with pagination
- **Get Product Details** - Retrieve comprehensive product information
- **Compare Products** - Side-by-side comparison of multiple products
- **Category Statistics** - Analyze pricing and availability in categories

#### Order & Purchase Management
- **Search Orders** - View user's order history
- **Track Orders** - Real-time order status tracking
- **Create Orders** - Autonomously create orders with specified items
- **Add to Cart** - Add products to shopping cart
- **Checkout** - Guide users to payment

#### Personalization
- **Recommendations** - AI-powered product recommendations based on purchase history
- **Purchase History** - Access previous orders and spending patterns

### 👨‍💼 Admin AI Agent

Admins can manage the entire store through natural language:

#### Order Management
- **View All Orders** - List orders with filtering by status
- **Update Order Status** - Change order status (PENDING → PAID)
- **Order Analytics** - Track pending vs. paid orders

#### Customer Management
- **User Profiles** - View user details and purchase history
- **List Users** - Browse all users with spending analytics
- **Customer Stats** - Track total orders, spending, and trends

#### Business Analytics
- **Sales Metrics** - Revenue, order count, average order value
- **Category Performance** - Best-selling categories and revenue
- **Top Customers** - Identify high-value customers
- **Sales Reports** - Generate custom reports by date range

#### Inventory & Pricing
- **Product Inventory** - Check sales and revenue by product
- **Update Prices** - Modify product pricing
- **Top Sellers** - Identify best-performing products

## Architecture

### Tool Files

#### `src/lib/agentTools.ts`
Contains all customer-facing AI agent tools:
- Product search and discovery
- Order management
- Recommendations
- Comparisons

#### `src/lib/adminAgentTools.ts`
Contains admin-only tools:
- Order management and fulfillment
- User management
- Analytics and reporting
- Pricing updates

### API Endpoints

#### Customer Chat
```
POST /api/chat
```
- **Request**: `{ messages: Message[], userId?: string }`
- **Response**: Streaming text response with tool calls
- **Tools**: All customer tools available

#### Admin Chat
```
POST /api/admin-chat
```
- **Request**: `{ messages: Message[] }`
- **Response**: Streaming text response with admin tools
- **Auth**: Requires ADMIN role
- **Tools**: All admin tools available

### Frontend Component

#### `src/Components/Chatbot.tsx`
Enhanced chatbot UI featuring:
- Real-time tool execution feedback
- Rich tool visualization (icons, status indicators)
- Animated thinking state
- Message badges showing conversation count
- Responsive design with Tailwind CSS

## Usage Examples

### Customer Examples

```
User: "Find me blue running shoes under $100"
Agent: Searches products, shows results with prices and descriptions

User: "What do other customers like me recommend?"
Agent: Uses purchase history to suggest personalized products

User: "Compare these three products"
Agent: Displays side-by-side comparison with prices and specs

User: "Show me my orders"
Agent: Retrieves and displays order history with status

User: "Track my last order"
Agent: Shows current status, total, and dates
```

### Admin Examples

```
Admin: "How many orders do we have this month?"
Agent: Generates sales analytics with revenue and order count

Admin: "Who are our top 5 customers?"
Agent: Lists top customers by spending with order counts

Admin: "Update order #12345 to paid"
Agent: Updates order status and confirms change

Admin: "What's our revenue by category?"
Agent: Breaks down sales by product category

Admin: "Generate sales report for January"
Agent: Creates detailed report with metrics and insights
```

## How Tool Calls Work

1. **User Input** - Customer or admin asks a question
2. **AI Processing** - Claude analyzes request and identifies needed tools
3. **Tool Execution** - Agent automatically calls relevant tools
4. **Data Retrieval** - Tools query database and return results
5. **Response Generation** - AI synthesizes results into natural response
6. **Client Actions** - UI executes client-side actions (navigation, cart updates)
7. **Feedback** - User sees results with visual indicators

## Tool Call Flow Example

```
User: "Show me men's shoes under $80"
     ↓
AI Analysis: Needs searchProducts tool
     ↓
Execute: searchProducts({ 
  category: "FOOTWEAR", 
  query: "shoes",
  maxPrice: 80 
})
     ↓
Database Query: Find products matching criteria
     ↓
Return Results: 5 products found
     ↓
AI Response: "I found 5 great options for you..."
     ↓
UI Display: Shows products with buy/cart buttons
```

## Tool Execution Features

### Real-time Feedback
Tools show:
- **Loading State** - Animated spinner with tool name
- **Success State** - Green checkmark with result summary
- **Error State** - Red alert if tool fails
- **Data Summary** - "Found 5 products", "Status: PAID", etc.

### Tool Icons
Each tool has a unique icon:
- 🔍 Search/Browse
- 🛒 Cart/Checkout
- 📦 Orders/Products
- 📊 Analytics
- ✅ Confirmation
- ⚡ Agent Status

### Agent Thinking State
When the agent is executing multiple tools:
- Header shows "Executing tasks..." 
- Animated pulse effect on agent icon
- Gradient animation at top of chat

## Advanced Capabilities

### Multi-Tool Chains
The agent can chain multiple tool calls:
```
User: "Find similar items to what I bought last"
Agent:
1. Gets user's purchase history (getUserOrders)
2. Extracts categories (analyzes results)
3. Searches similar products (searchProducts)
4. Returns personalized suggestions
```

### Autonomous Decision Making
The agent decides when to use tools based on:
- User intent analysis
- Conversation context
- Data availability
- User preferences

### Context Awareness
The agent remembers:
- Previous messages in conversation
- User ID for personalization
- Product context from searches
- Order details for tracking

## Customization

### Adding New Tools

1. Create tool in appropriate file:
```typescript
export const agentTools = {
  myNewTool: tool({
    description: "Tool description",
    parameters: z.object({ /* params */ }),
    execute: async (args) => {
      // Implementation
      return JSON.stringify(result);
    },
  }),
};
```

2. Add UI feedback in Chatbot component:
```typescript
const toolIcons = {
  myNewTool: <IconComponent size={12} />,
};
```

### Modifying Tool Behavior

Edit tool definition in:
- `src/lib/agentTools.ts` - Customer tools
- `src/lib/adminAgentTools.ts` - Admin tools

### Styling

Customize chatbot appearance in:
- `src/Components/Chatbot.tsx` - Main styling

## Performance

- **Max Tool Roundtrips**: 5 (prevents infinite loops)
- **API Timeout**: 60 seconds
- **Response Streaming**: Real-time message streaming
- **Database Pagination**: Efficient data retrieval with limits

## Security

- ✅ Admin route requires ADMIN role verification
- ✅ User context passed for personalization (optional)
- ✅ Tool parameters validated with Zod
- ✅ Clerk authentication integration
- ✅ No sensitive data exposed in responses

## Future Enhancements

- [ ] Voice input/output support
- [ ] Multi-language support
- [ ] Sentiment analysis for customer feedback
- [ ] Automated customer support responses
- [ ] Predictive analytics
- [ ] Integration with payment systems for real-time status
- [ ] Inventory alerts and low-stock notifications
- [ ] Customer segmentation and targeting
- [ ] A/B testing for product recommendations

## Troubleshooting

### Tools not executing
- Check that tool parameters match schema
- Verify database connection
- Check user permissions for admin tools

### Empty results
- Verify data exists in database
- Check query filters (category, price, etc.)
- Ensure date filters are correct

### Slow responses
- Check database query performance
- Reduce data limit on searches
- Check AI API rate limits

## Dependencies

- `ai` - AI SDK for tool calling
- `@ai-sdk/openai` - OpenAI integration
- `@ai-sdk/react` - React hooks for chat
- `prisma` - Database ORM
- `zod` - Schema validation
- `lucide-react` - Icons

---

**Last Updated**: March 8, 2026  
**Version**: 2.0 (AI Agent Edition)
