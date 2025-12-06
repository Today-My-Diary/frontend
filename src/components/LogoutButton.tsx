import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { mutations } from "@/api";
import { useTokenStore } from "@/stores/useTokenStore";
import { useToast } from "@/hooks/useToast";
import { useFCMStore } from "@/stores/useFCMStore";
import { useNavigate } from "@tanstack/react-router";
import { useModalStore } from "@/stores/useModalStore";

export function LogoutButton() {
  const navigate = useNavigate();
  const { deauthorize } = useTokenStore();
  const { showToast } = useToast();
  const { fcmToken, setFcmToken } = useFCMStore();
  const { confirm } = useModalStore();

  const { mutate: logout } = useMutation({
    ...mutations.auth.logout,
    onSuccess: () => {
      deauthorize();
      setFcmToken(null);
      showToast({ type: "success", description: "로그아웃되었습니다." });
      navigate({ to: "/welcome" });
    },
  });

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: "로그아웃",
      description: "정말 로그아웃하시겠습니까?",
    });
    if (isConfirmed) {
      logout({ fcmToken: fcmToken ?? undefined });
    }
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}
