import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from "@expo-google-fonts/atkinson-hyperlegible";
import { loadToday, signIn, signOut, type TodayItem, type TodayResponse } from "./src/api";

const TOKEN_KEY = "checkin-kids-mobile-session";
const colors = {
  background: "#FAFAF8", surface: "#FFFFFF", text: "#2D2D2D", muted: "#595959",
  accent: "#345F70", border: "#C8C4BD", now: "#345F70", nowBg: "#EDF4F7",
  done: "#49735A", doneBg: "#EFF6F1", pending: "#646464", pendingBg: "#F5F5F4",
  attention: "#845B39", attentionBg: "#F9F3EC",
};

function statusLabel(item: TodayItem): string {
  if (item.kind === "event") return "Event";
  if (item.status === "done") return "Done";
  if (item.status === "skipped") return "Needs attention";
  if (item.status === "in_progress") return "In progress";
  return "Upcoming";
}

function itemColors(item: TodayItem): { border: string; background: string } {
  if (item.status === "done") return { border: colors.done, background: colors.doneBg };
  if (item.status === "skipped") return { border: colors.attention, background: colors.attentionBg };
  if (item.status === "in_progress") return { border: colors.now, background: colors.nowBg };
  return { border: colors.pending, background: colors.pendingBg };
}

export default function App() {
  const [fontsLoaded] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (currentToken: string) => {
    setBusy(true);
    setError(null);
    try {
      setToday(await loadToday(currentToken));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not load today.";
      setError(message);
      if (message === "Not authorised.") {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setToday(null);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) {
        setToken(stored);
        void refresh(stored);
      } else {
        setBusy(false);
      }
    }).catch(() => {
      setError("Could not open secure storage.");
      setBusy(false);
    });
  }, [refresh]);

  async function handleLogin() {
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    try {
      const session = await signIn(email, password);
      await SecureStore.setItemAsync(TOKEN_KEY, session);
      setPassword("");
      setToken(session);
      await refresh(session);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not log in.");
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (token) {
      try { await signOut(token); } catch { /* Clear this device even if the server is offline. */ }
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setToday(null);
    setError(null);
  }

  if (!fontsLoaded) return <SafeAreaView style={styles.screen}><ActivityIndicator color={colors.accent} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>CheckIn Kids</Text>
        {!token ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>Log in</Text>
            <Text style={styles.intro}>Use your child account to see today&apos;s schedule.</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} accessibilityLabel="Password" autoComplete="current-password" secureTextEntry value={password} onChangeText={setPassword} />
            {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
            <Pressable style={styles.button} accessibilityRole="button" disabled={busy || !email || !password} onPress={() => void handleLogin()}>
              <Text style={styles.buttonText}>{busy ? "Loading…" : "Log in"}</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View style={styles.topRow}>
              <View style={styles.titleGroup}>
                <Text style={styles.heading}>Today</Text>
                {today && <Text style={styles.date}>{new Date(`${today.date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</Text>}
              </View>
              <Pressable style={styles.secondaryButton} accessibilityRole="button" onPress={() => void handleLogout()}><Text style={styles.secondaryText}>Log out</Text></Pressable>
            </View>
            {today && <Text style={styles.greeting}>{today.childName}&apos;s schedule</Text>}
            {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
            {busy && <ActivityIndicator color={colors.accent} accessibilityLabel="Loading schedule" />}
            {!busy && today && today.items.length === 0 && <Text style={styles.empty}>Nothing scheduled for today.</Text>}
            {today?.items.map((item) => {
              const palette = itemColors(item);
              return <View key={`${item.kind}-${item.id}`} style={[styles.card, { borderLeftColor: palette.border, backgroundColor: palette.background }]}>
                <Text style={styles.time}>{item.time}{item.endTime ? `–${item.endTime}` : ""}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.status}>{statusLabel(item)}</Text>
              </View>;
            })}
            <Pressable style={styles.secondaryButton} accessibilityRole="button" disabled={busy} onPress={() => token && void refresh(token)}><Text style={styles.secondaryText}>Refresh</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  brand: { color: colors.text, fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 32 },
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 24 },
  heading: { color: colors.text, fontSize: 28, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 25, fontFamily: "AtkinsonHyperlegible_400Regular", marginBottom: 24 },
  label: { color: colors.text, fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.surface, color: colors.text, fontFamily: "AtkinsonHyperlegible_400Regular", fontSize: 16, paddingHorizontal: 14, marginBottom: 20 },
  button: { minHeight: 48, backgroundColor: colors.accent, borderRadius: 6, justifyContent: "center", alignItems: "center", marginTop: 8 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  secondaryButton: { minHeight: 44, borderColor: colors.border, borderWidth: 1, borderRadius: 6, paddingHorizontal: 18, justifyContent: "center", alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surface },
  secondaryText: { color: colors.accent, fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold" },
  error: { color: colors.attention, backgroundColor: colors.attentionBg, padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  titleGroup: { flex: 1, paddingRight: 12 },
  date: { color: colors.muted, fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular" },
  greeting: { color: colors.text, fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 20 },
  empty: { color: colors.muted, fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular", marginBottom: 24 },
  card: { borderLeftWidth: 4, borderRadius: 10, padding: 20, marginBottom: 16 },
  time: { color: colors.text, fontSize: 16, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  itemTitle: { color: colors.text, fontSize: 18, fontFamily: "AtkinsonHyperlegible_700Bold", marginBottom: 8 },
  status: { color: colors.muted, fontSize: 16, fontFamily: "AtkinsonHyperlegible_400Regular" },
});
