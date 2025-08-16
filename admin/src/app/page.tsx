"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, CheckSquare, Bell } from "lucide-react";
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, tokens } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, tokens, router]);
  if (isAuthenticated && tokens?.accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>{" "}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {" "}
      <div className="container mx-auto px-4 py-16">
        {" "}
        {/* Header */}{" "}
        <div className="text-center mb-16">
          {" "}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {" "}
            homeTeam Admin Dashboard{" "}
          </h1>{" "}
          <p className="text-xl text-gray-600 mb-8">
            {" "}
            Aile görev yönetimi uygulamanız için kapsamlı yönetim paneli{" "}
          </p>{" "}
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {" "}
            Giriş Yap{" "}
          </Button>{" "}
        </div>{" "}
        {/* Features Grid */}{" "}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {" "}
          <Card>
            {" "}
            <CardHeader className="text-center">
              {" "}
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />{" "}
              <CardTitle>Analytics</CardTitle>{" "}
              <CardDescription>
                {" "}
                Detaylı performans metrikleri ve grafikler{" "}
              </CardDescription>{" "}
            </CardHeader>{" "}
          </Card>{" "}
          <Card>
            {" "}
            <CardHeader className="text-center">
              {" "}
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />{" "}
              <CardTitle>Kullanıcı Yönetimi</CardTitle>{" "}
              <CardDescription>
                {" "}
                Kullanıcıları ve grupları yönetin{" "}
              </CardDescription>{" "}
            </CardHeader>{" "}
          </Card>{" "}
          <Card>
            {" "}
            <CardHeader className="text-center">
              {" "}
              <CheckSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />{" "}
              <CardTitle>Görev Takibi</CardTitle>{" "}
              <CardDescription> Görevleri ve SLAları izleyin </CardDescription>{" "}
            </CardHeader>{" "}
          </Card>{" "}
          <Card>
            {" "}
            <CardHeader className="text-center">
              {" "}
              <Bell className="h-12 w-12 text-orange-600 mx-auto mb-4" />{" "}
              <CardTitle>Bildirimler</CardTitle>{" "}
              <CardDescription> Sistem bildirimlerini yönetin </CardDescription>{" "}
            </CardHeader>{" "}
          </Card>{" "}
        </div>{" "}
        {/* Stats */}{" "}
        <Card className="max-w-4xl mx-auto">
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-center">
              Platform Özellikleri
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {" "}
              <div>
                {" "}
                <h3 className="text-2xl font-bold text-blue-600 mb-2">
                  Real-time
                </h3>{" "}
                <p className="text-gray-600">
                  Anlık güncellemeler ve bildirimler
                </p>{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Modern UI
                </h3>{" "}
                <p className="text-gray-600">
                  Responsive ve kullanıcı dostu arayüz
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-600 mb-2">
                  Secure
                </h3>
                <p className="text-gray-600">JWT tabanlı güvenlik</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>&copy; 2025 homeTeam Admin Dashboard. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
