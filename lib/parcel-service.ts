import supabase from "@/lib/supabase";

/* 🔍 Fetch parcel by QR / tracking ID */
export async function fetchParcelByTrackingId(trackingId: string) {
  return supabase
    .from("parcels")
    .select("*")
    .eq("tracking_id", trackingId)
    .single();
}

/* ➕ Create parcel manually */
export async function createParcel(data: {
  tracking_id: string;
  sender_name: string;
  receiver_name: string;
}) {
  return supabase.from("parcels").insert({
    ...data,
    status: "Pending",
  });
}
