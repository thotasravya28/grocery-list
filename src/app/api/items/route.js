import { connectDB } from "../../../lib/mongodb";
import Item from "../../../models/Item";

// GET items by family code
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const items = await Item.find({ code });

  return Response.json(items);
}

// POST add item
export async function POST(req) {
  await connectDB();

  const body = await req.json();

  const item = await Item.create(body);

  return Response.json(item);
}

// PUT update item
export async function PUT(req) {
  await connectDB();

  const body = await req.json();

  const updated = await Item.findByIdAndUpdate(
    body._id,
    body,
    { new: true }
  );

  return Response.json(updated);
}

// DELETE item
export async function DELETE(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await Item.findByIdAndDelete(id);

  return Response.json({ success: true });
}