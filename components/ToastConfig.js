import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#4F46E5",
        backgroundColor: "#EEF2FF",
        borderRadius: 14,
        height: 65,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
      }}
      text2Style={{
        fontSize: 13,
        color: "#6B7280",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        backgroundColor: "#FEE2E2",
        borderRadius: 14,
        height: 65,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
      }}
      text2Style={{
        fontSize: 13,
        color: "#6B7280",
      }}
    />
  ),
};