import React, { useContext } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { LanguageContext } from "../contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useContext(LanguageContext);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("select_language")}:</Text>
      <View style={styles.buttons}>
        <Button title="English" onPress={() => setLanguage("en")} disabled={language === "en"} />
        <Button title="العربية" onPress={() => setLanguage("ar")} disabled={language === "ar"} />
        <Button title="Français" onPress={() => setLanguage("fr")} disabled={language === "fr"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
});
