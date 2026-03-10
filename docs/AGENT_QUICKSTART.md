# AI Agent Setup & Quick Start Guide

## What's Changed

Your chatbot has been upgraded from a simple shopping assistant to a **full-featured AI agent** capable of:
- Autonomous task execution
- Multi-step problem solving
- Complex data analysis
- Business decision support (admin)
- Personalized recommendations

## Quick Start

### For Customers

1. **Open the chat** - Click the ⚡ icon in the bottom-right
2. **Ask naturally** - Type any shopping question
3. **Agent executes** - Watch the agent execute tasks in real-time
4. **Get results** - View products, orders, recommendations, etc.

#### Example Questions:
- "Show me leather bags under $150"
- "What would you recommend for me?"
- "Track my order"
- "Compare these three products"
- "Show me bestsellers in electronics"

### For Admins

1. **Go to admin dashboard** - Navigate to `/admin`
2. **Use AI chat** - A new admin chat is available
3. **Ask business questions** - The agent analyzes data
4. **Get insights** - Sales reports, customer analytics, etc.

#### Example Questions:
- "How many orders did we get this month?"
- "Who are our top customers?"
- "Update order #XYZ to paid"
- "What's our revenue by category?"
- "Generate a sales report for February"

## New Files Created

### Core Agent Files
- **`src/lib/agentTools.ts`** - All customer-facing tools (15+ capabilities)
- **`src/lib/adminAgentTools.ts`** - Admin management tools (8+ capabilities)
- **`src/app/api/chat/route.ts`** - Updated with agent system
- **`src/app/api/admin-chat/route.ts`** - Admin chat endpoint

### Documentation
- **`docs/AI_AGENT_GUIDE.md`** - Complete feature documentation

### Enhanced Component
- **`src/Components/Chatbot.tsx`** - New UI with tool feedback

## Key Features

### 🚀 Autonomous Execution
The agent automatically:
- Identifies the right tools to use
- Chains multiple tool calls for complex tasks
- Adapts based on results
- Provides clear feedback

### 🎯 Rich Tool Feedback
See real-time status:
- Loading spinner while executing
- Green checkmark on success
- Error alerts when needed
- Result summaries (e.g., "Found 5 products")

### 🧠 Context Awareness
The agent understands:
- Your purchase history (if logged in)
- Product categories and specs
- Order status and history
- Business metrics (admin only)

### 🎨 Enhanced UI
- New agent icon (lightning bolt ⚡)
- Message counter badge
- Animated thinking state
- Better tool visualizations

## Tool Categories

### Customer Tools (15 tools)
- **Discovery**: Search, browse, get details, compare
- **Recommendations**: Personalized suggestions
- **Orders**: View, track, create
- **Shopping**: Add to cart, checkout

### Admin Tools (8 tools)
- **Orders**: View all, update status
- **Users**: Profile, list, analytics
- **Analytics**: Sales metrics, reports
- **Inventory**: Check stock, update prices

## How It Works

1. **You ask a question** → AI analyzes what you need
2. **AI calls tools** → Database queries execute
3. **Results return** → AI processes data
4. **You see results** → Beautiful, formatted response
5. **Next steps** → Add to cart, checkout, etc.

## Testing the Agent

Try these commands:

### Product Search
```
"Find wireless headphones under $50"
```
✓ Uses searchProducts tool  
✓ Returns filtered results

### Recommendations
```
"What should I buy?"
```
✓ Analyzes your history  
✓ Returns personalized items

### Order Tracking
```
"Show me my last order"
```
✓ Retrieves order history  
✓ Shows current status

### Admin Analytics
```
"How's our revenue this month?"
```
✓ (Admin only)  
✓ Calculates metrics  
✓ Returns business summary

## Configuration

### Update System Prompts
Edit in:
- `/src/app/api/chat/route.ts` - Customer prompt
- `/src/app/api/admin-chat/route.ts` - Admin prompt

### Add New Tools
1. Create tool in appropriate file
2. Add icon mapping in Chatbot component
3. Tool is automatically available

### Customize Tool Behavior
Edit execute functions in:
- `src/lib/agentTools.ts`
- `src/lib/adminAgentTools.ts`

## Performance Tips

- Agent processes multiple tools efficiently
- Database queries are optimized with limits
- Streaming responses for smooth UX
- Pagination for large datasets

## Security Notes

✅ Admin routes require admin verification  
✅ User data only used with permission  
✅ Tool parameters validated  
✅ Clerk integration for auth  

## Troubleshooting

### Agent not responding
- Check OpenAI API key is set
- Verify database connection
- Check Claude/OpenAI token limits

### No search results
- Try different keywords
- Check if products exist in database
- Verify category names

### Admin features unavailable
- Login as admin user
- Verify ADMIN role in database
- Check `/admin-chat` endpoint

## Next Steps

1. **Customize** - Add your own tools
2. **Integrate** - Connect to payment systems
3. **Monitor** - Track agent usage
4. **Optimize** - Improve based on usage
5. **Expand** - Add more tools/features

## API Reference

### Customer Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Find blue shoes"}],
    "userId": "user-123"
  }'
```

### Admin Chat
```bash
curl -X POST http://localhost:3000/api/admin-chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "assistant", "content": "Show sales this month"}]
  }'
```

## Support

For issues:
1. Check documentation in `docs/AI_AGENT_GUIDE.md`
2. Review tool definitions in `src/lib/`
3. Verify API keys and database connection
4. Check browser console for errors

---

**Version**: 2.0  
**Last Updated**: March 8, 2026  
**Status**: Production Ready ✓
