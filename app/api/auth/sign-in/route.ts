import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/sign-in`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const result = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: result.message || "Xato!" },
        { status: backendRes.status },
      );
    }

    const userData = result.data;
    const token = userData?.token;

    if (!token) {
      return NextResponse.json({ message: "Token topilmadi" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (userData) {
      const miniUser = {
        _id: userData._id,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        image: userData.image,
      };

      response.cookies.set("user", JSON.stringify(miniUser), {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server xatosi" }, { status: 500 });
  }
}
