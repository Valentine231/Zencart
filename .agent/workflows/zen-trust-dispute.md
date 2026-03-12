---
description: How the Zen-Trust AI handles a "Pay on Delivery" dispute using visual proof.
---

# Zen-Trust Dispute Resolution Workflow

This workflow is triggered when a buyer reports an issue with a "Pay on Delivery" (POD) order.

## 1. Trigger
User sends a complaint (e.g., "This cloth no match the one I buy" or "The color dey different").

## 2. Order Identification
- AI uses `getUserOrders` or `getOrderDetails` to identify the specific POD order.
- AI checks `isPod` and `escrowStatus` (should be `HELD`).

## 3. Evidence Collection
- AI fetches `dispatchVideoUrl` from the `Order` record (Seller Proof).
- AI asks the User for a photo of the received item (`evidenceUrl`).
- // turbo
- AI calls `initiatePodDispute` with the reason and evidence.

## 4. Mediation (AI Verdict)
- AI compares the `dispatchVideoUrl` (what was sent) with the buyer's evidence (what was received).
- AI uses its internal "Street-Smart" logic to judge:
    - **MATCH**: If the item is the same, AI explains this to the user in Pidgin/English.
    - **MISMATCH**: If the item is clearly different, AI marks it as a mismatch.
- // turbo
- AI calls `mediateDispute` with the verdict and resolution text.

## 5. Settlement
- **If Verdict is MATCH/REJECTED**: AI encourages user to confirm and then calls `releaseEscrow`.
- **If Verdict is MISMATCH**: AI keeps funds in `DISPUTED` status and notifies the Merchant for return/refund.
