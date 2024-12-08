import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { doc, deleteDoc } from "firebase/firestore";
import { database } from "@/lib/firebaseConfig";

if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountEnv) {
    throw new Error(
      "Variabel lingkungan FIREBASE_SERVICE_ACCOUNT tidak ditemukan. Pastikan telah ditambahkan di Vercel."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(
      Buffer.from(serviceAccountEnv, "base64").toString("utf-8")
    );
  } catch (error) {
    throw new Error("Gagal mendekode serviceAccount JSON: " + error.message);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "ptsp-bmkg-4eee9",
  });
}

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "UID tidak ditemukan!" },
        { status: 400 }
      );
    }

    await admin.auth().deleteUser(uid);

    const referensiAdmin = doc(database, "admin", uid);
    await deleteDoc(referensiAdmin);

    return NextResponse.json(
      { message: "Admin berhasil dihapus!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
