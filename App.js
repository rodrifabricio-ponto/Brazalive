// BLOCO 1: Imports + Constantes + Componentes Base

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, StatusBar,
  ActivityIndicator, Alert, TextInput, KeyboardAvoidingView,
  Platform, Animated, Modal, FlatList, Image, Dimensions,
  RefreshControl,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenCapture from 'expo-screen-capture';

let RNAgora = null;
try { RNAgora = require('react-native-agora'); } catch (_) {}
const AGORA_OK = !!RNAgora;

// ── CONFIG ────────────────────────────────────────────────────
const SUPA_URL    = 'https://ypvxgzrcfvfgzlvsgziq.supabase.co';
const SUPA_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdnhnenJjZnZmZ3psdnNnemlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzI3NDUsImV4cCI6MjA5MTM0ODc0NX0.z0-Tr7KGRje8yDMvvnWObyXLCXdFnxnfGyKZbrmFltE ';
const AGORA_ID    = '7312397a90e848159d717212cd83d965';
const ADMIN_EMAIL = 'fs649588@gmail.com';
const HOST_SPLIT  = 0.55;
const CONV_RATE   = 1.5;
const MIN_SAQUE   = 50000;

const db = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── CORES ─────────────────────────────────────────────────────
const C = {
  bg:      '#030308',
  s1:      '#0B0B12',
  s2:      '#11111B',
  s3:      '#181824',
  border:  '#1E1E2A',
  red:     '#FF2E3F',
  green:   '#22C55E',
  gold:    '#FFB800',
  blue:    '#3B82F6',
  purple:  '#A855F7',
  white:   '#FFFFFF',
  gray:    '#9999A8',
  muted:   '#55555F',
};

// ── UTILS ─────────────────────────────────────────────────────
const SW  = Dimensions.get('window').width;
const fmt = n => Number(n || 0).toLocaleString('pt-BR');
const fmtR = n => 'R$ ' + (Number(n || 0) / 1000 * CONV_RATE).toFixed(2).replace('.', ',');
const fmtH = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};
const fmtD = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
const fmtCPF = v => {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length > 9) return n.slice(0,3)+'.'+n.slice(3,6)+'.'+n.slice(6,9)+'-'+n.slice(9);
  if (n.length > 6) return n.slice(0,3)+'.'+n.slice(3,6)+'.'+n.slice(6);
  if (n.length > 3) return n.slice(0,3)+'.'+n.slice(3);
  return n;
};
const fmtData = v => {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length > 4) return n.slice(0,2)+'/'+n.slice(2,4)+'/'+n.slice(4);
  if (n.length > 2) return n.slice(0,2)+'/'+n.slice(2);
  return n;
};

const EMOJIS = ['👩🏻','👩🏽','👩🏾','👩🏿','👩🏻‍🦰','👩🏽‍🦱','👱🏼‍♀️','👩🏻‍🦳'];
const av = i => EMOJIS[Math.abs(i || 0) % EMOJIS.length];

// ── GIFTS ─────────────────────────────────────────────────────
const GIFTS = [
  { id:1,  emoji:'🌹', name:'Rosa',       coins:1      },
  { id:2,  emoji:'💋', name:'Beijo',      coins:5      },
  { id:3,  emoji:'🍫', name:'Brigadeiro', coins:10     },
  { id:4,  emoji:'🍺', name:'Brahma',     coins:20     },
  { id:5,  emoji:'🌽', name:'Pamonha',    coins:50     },
  { id:6,  emoji:'🍉', name:'Melancia',   coins:100    },
  { id:7,  emoji:'⚽', name:'Bola',       coins:200    },
  { id:8,  emoji:'🎸', name:'Violão',     coins:500    },
  { id:9,  emoji:'🇧🇷', name:'Brasil',   coins:800    },
  { id:10, emoji:'💎', name:'Diamante',   coins:1000   },
  { id:11, emoji:'👑', name:'Coroa',      coins:5000   },
  { id:12, emoji:'🏆', name:'Hexa',       coins:10000  },
  { id:13, emoji:'🚀', name:'Foguete',    coins:30000  },
  { id:14, emoji:'🐆', name:'Onça Elite', coins:50000  },
];

const PACOTES = [
  { id:1, coins:4000,  bonus:100,  preco:'R$ 9,90',   label:'Iniciante'         },
  { id:2, coins:10000, bonus:300,  preco:'R$ 16,00',  label:'Popular', hot:true  },
  { id:3, coins:22000, bonus:500,  preco:'R$ 31,00',  label:'Pro'               },
  { id:4, coins:40000, bonus:1000, preco:'R$ 55,00',  label:'VIP'               },
  { id:5, coins:80000, bonus:2000, preco:'R$ 108,90', label:'Elite'             },
];

const CATS = ['conversa','música','beleza','fitness','games','culinária','dança','humor'];

// BLOCO 2: Componentes Base

function Logo({ size = 24 }) {
  const parts = [['Br','#FF2E3F'],['az','#FF6A2E'],['al','#FFB800'],['ive','#22C55E']];
  return (
    <View style={{ flexDirection:'row' }}>
      {parts.map(([t,cor]) => (
        <Text key={t} style={{ fontSize:size, fontWeight:'900', fontStyle:'italic', color:cor }}>{t}</Text>
      ))}
    </View>
  );
}

function Moeda({ size = 20 }) {
  const r = size / 2;
  return (
    <View style={{ width:size, height:size, borderRadius:r, backgroundColor:'#B8760A', alignItems:'center', justifyContent:'center', borderWidth:size*0.07, borderColor:'#FFD700' }}>
      <Text style={{ fontSize:size*0.45 }}>🐆</Text>
    </View>
  );
}

function Avatar({ uri, emoji = '👤', size = 44, online = false }) {
  const r = size / 2;
  return (
    <View style={{ width:size, height:size, borderRadius:r, backgroundColor:C.s2, alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
      {uri
        ? <Image source={{ uri }} style={{ width:size, height:size }} resizeMode="cover" />
        : <Text style={{ fontSize:size * 0.58 }}>{emoji}</Text>
      }
      {online && (
        <View style={{ position:'absolute', bottom:1, right:1, width:size*0.28, height:size*0.28, borderRadius:99, backgroundColor:C.green, borderWidth:1.5, borderColor:C.bg }} />
      )}
    </View>
  );
}

const Btn = memo(function Btn({ label, onPress, cor = C.red, outline, style, icon, loading, disabled, small }) {
  const pv = small ? 10 : 14;
  const ph = small ? 14 : 18;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[{
        backgroundColor: outline ? 'transparent' : cor,
        borderRadius:12, paddingVertical:pv, paddingHorizontal:ph,
        alignItems:'center', justifyContent:'center', flexDirection:'row', gap:7,
        borderWidth: outline ? 1.5 : 0, borderColor:cor,
        opacity: (disabled || loading) ? 0.5 : 1,
      }, style]}
    >
      {loading
        ? <ActivityIndicator size="small" color={outline ? cor : C.white} />
        : <>
            {icon && <Ionicons name={icon} size={small?15:18} color={outline ? cor : C.white} />}
            <Text style={{ color: outline ? cor : C.white, fontSize:small?13:15, fontWeight:'700' }}>{label}</Text>
          </>
      }
    </Pressable>
  );
});

function Campo({ label, placeholder, value, onChange, secure, keyboard, icon, multiline, maxLen, capWords }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom:14 }}>
      {label ? <Text style={{ color:C.gray, fontSize:12, fontWeight:'600', marginBottom:5 }}>{label}</Text> : null}
      <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:11, paddingHorizontal:13, paddingVertical:11, borderWidth:1, borderColor:C.border, minHeight:46 }}>
        {icon ? <Ionicons name={icon} size={17} color={C.muted} style={{ marginRight:9 }} /> : null}
        <TextInput
          style={{ flex:1, color:C.white, fontSize:14, padding:0, maxHeight: multiline ? 110 : undefined }}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure && !show}
          keyboardType={keyboard || 'default'}
          autoCapitalize={capWords ? 'words' : 'none'}
          autoCorrect={false}
          multiline={multiline}
          maxLength={maxLen}
        />
        {secure ? (
          <Pressable onPress={() => setShow(s => !s)} hitSlop={10}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Header({ titulo, onBack, direita }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop:insets.top+8, paddingBottom:10, paddingHorizontal:16, backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border, flexDirection:'row', alignItems:'center' }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={{ width:36, height:36, borderRadius:18, backgroundColor:C.s2, alignItems:'center', justifyContent:'center', marginRight:10 }}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </Pressable>
      ) : <View style={{ width:36, marginRight:10 }} />}
      {typeof titulo === 'string'
        ? <Text style={{ flex:1, color:C.white, fontSize:16, fontWeight:'800' }}>{titulo}</Text>
        : <View style={{ flex:1 }}>{titulo}</View>
      }
      <View style={{ width:36, alignItems:'flex-end' }}>{direita || null}</View>
    </View>
  );
}

function Vazio({ emoji, titulo, sub }) {
  return (
    <View style={{ alignItems:'center', paddingVertical:56, paddingHorizontal:28 }}>
      <Text style={{ fontSize:58 }}>{emoji}</Text>
      <Text style={{ color:C.white, fontSize:17, fontWeight:'800', marginTop:14, textAlign:'center' }}>{titulo}</Text>
      {sub ? <Text style={{ color:C.gray, fontSize:13, marginTop:7, textAlign:'center', lineHeight:21 }}>{sub}</Text> : null}
    </View>
  );
}

function Badge({ label, cor = C.red }) {
  return (
    <View style={{ backgroundColor:cor+'22', borderRadius:7, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:cor+'44' }}>
      <Text style={{ color:cor, fontSize:10, fontWeight:'800' }}>{label}</Text>
    </View>
  );
}

function GiftAnim({ gift, onFim }) {
  const sc = useRef(new Animated.Value(0.2)).current;
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(sc, { toValue:1, tension:55, friction:7, useNativeDriver:true }),
        Animated.timing(op, { toValue:1, duration:300, useNativeDriver:true }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(op, { toValue:0, duration:400, useNativeDriver:true }),
        Animated.timing(ty, { toValue:-60, duration:400, useNativeDriver:true }),
      ]),
    ]).start(onFim);
  }, []);
  return (
    <Animated.View style={{ position:'absolute', top:'18%', left:0, right:0, alignItems:'center', opacity:op, transform:[{ scale:sc },{ translateY:ty }], zIndex:99, pointerEvents:'none' }}>
      <View style={{ backgroundColor:'rgba(5,5,20,0.94)', borderRadius:22, padding:26, alignItems:'center', borderWidth:1.5, borderColor:'rgba(255,184,0,0.6)', minWidth:200 }}>
        <Text style={{ fontSize:72 }}>{gift.emoji}</Text>
        <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginTop:8 }}>{gift.name}</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:10 }}>
          <Moeda size={16} />
          <Text style={{ color:C.gold, fontSize:14, fontWeight:'800' }}>{fmt(gift.coins)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function PainelGifts({ visible, onClose, onEnviar }) {
  const [sel, setSel] = useState(null);
  const insets = useSafeAreaInsets();
  const gift = GIFTS.find(g => g.id === sel);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{ backgroundColor:'#0F0F18', borderTopLeftRadius:22, borderTopRightRadius:22, maxHeight:'65%', paddingBottom:insets.bottom+8 }}>
        <View style={{ flexDirection:'row', alignItems:'center', padding:15, borderBottomWidth:1, borderBottomColor:C.border }}>
          <Text style={{ flex:1, color:C.white, fontSize:15, fontWeight:'800' }}>🎁 Presentes</Text>
          <Pressable onPress={onClose} hitSlop={12}><Ionicons name="close" size={22} color={C.gray} /></Pressable>
        </View>
        <FlatList
          data={GIFTS}
          numColumns={5}
          contentContainerStyle={{ padding:10 }}
          columnWrapperStyle={{ justifyContent:'space-between' }}
          keyExtractor={item => String(item.id)}
          getItemLayout={(_, i) => ({ length:90, offset:90*i, index:i })}
          renderItem={({ item }) => {
            const ativo = sel === item.id;
            return (
              <Pressable onPress={() => setSel(ativo ? null : item.id)} style={{ width:'18%', alignItems:'center', padding:6, borderRadius:11, marginBottom:8, backgroundColor:ativo?'rgba(255,46,63,0.12)':C.s1, borderWidth:1.5, borderColor:ativo?C.red:'transparent' }}>
                <Text style={{ fontSize:26 }}>{item.emoji}</Text>
                <Text style={{ color:C.white, fontSize:8, fontWeight:'600', marginTop:3, textAlign:'center' }} numberOfLines={1}>{item.name}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:2, marginTop:2 }}>
                  <Moeda size={8} />
                  <Text style={{ color:C.gold, fontSize:8, fontWeight:'700' }}>{item.coins>=1000 ? Math.floor(item.coins/1000)+'k' : item.coins}</Text>
                </View>
              </Pressable>
            );
          }}
        />
        {gift ? (
          <View style={{ margin:10, backgroundColor:C.s1, borderRadius:14, padding:13, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1.5, borderColor:C.red }}>
            <Text style={{ fontSize:34 }}>{gift.emoji}</Text>
            <View style={{ flex:1 }}>
              <Text style={{ color:C.white, fontSize:14, fontWeight:'800' }}>{gift.name}</Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap:5, marginTop:3 }}>
                <Moeda size={13} /><Text style={{ color:C.gold, fontSize:12 }}>{fmt(gift.coins)} coins</Text>
              </View>
            </View>
            <Pressable onPress={() => { onEnviar(gift); onClose(); setSel(null); }} style={{ backgroundColor:C.red, borderRadius:20, paddingHorizontal:18, paddingVertical:10 }}>
              <Text style={{ color:C.white, fontSize:14, fontWeight:'800' }}>Enviar</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={{ color:C.muted, fontSize:12, textAlign:'center', paddingVertical:10 }}>Toque em um presente</Text>
        )}
      </View>
    </Modal>
  );
}

// BLOCO 3: Auth Screens

function Splash({ onFim }) {
  const sc = useRef(new Animated.Value(0.2)).current;
  const op = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(sc, { toValue:1, tension:55, friction:7, useNativeDriver:true }),
        Animated.timing(op, { toValue:1, duration:500, useNativeDriver:true }),
      ]),
      Animated.delay(900),
      Animated.timing(out, { toValue:0, duration:350, useNativeDriver:true }),
    ]).start(onFim);
  }, []);
  return (
    <Animated.View style={{ flex:1, backgroundColor:C.bg, alignItems:'center', justifyContent:'center', opacity:out }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Animated.View style={{ alignItems:'center', opacity:op, transform:[{ scale:sc }] }}>
        <View style={{ width:96, height:96, borderRadius:48, backgroundColor:'rgba(255,46,63,0.12)', alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'rgba(255,46,63,0.3)', marginBottom:18 }}>
          <Text style={{ fontSize:54 }}>🐆</Text>
        </View>
        <Logo size={42} />
        <Text style={{ color:C.muted, fontSize:11, marginTop:10, letterSpacing:3 }}>CONECTE · BRILHE · GANHE</Text>
      </Animated.View>
    </Animated.View>
  );
}

function Entrada({ onLogin, onCadastro }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:28 }}>
        <View style={{ width:90, height:90, borderRadius:45, backgroundColor:'rgba(255,46,63,0.1)', alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'rgba(255,46,63,0.25)', marginBottom:18 }}>
          <Text style={{ fontSize:50 }}>🐆</Text>
        </View>
        <Logo size={44} />
        <Text style={{ color:C.muted, fontSize:12, marginTop:9, letterSpacing:2 }}>LIVE STREAMING BRASILEIRO</Text>
      </View>
      <View style={{ padding:22, gap:11, paddingBottom:insets.bottom+22 }}>
        <Btn label="Entrar na conta" onPress={onLogin} icon="log-in-outline" />
        <Btn label="Criar conta grátis" onPress={onCadastro} outline icon="person-add-outline" />
      </View>
    </View>
  );
}

function Login({ onBack, onCadastro }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    const { error } = await db.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });
    setLoading(false);
    if (error) Alert.alert('Erro ao entrar', error.message);
  }

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.bg }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <Header titulo="Entrar" onBack={onBack} />
      <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:'center', padding:22, paddingBottom:insets.bottom+20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color:C.white, fontSize:24, fontWeight:'900', marginBottom:4 }}>Bem-vindo de volta 👋</Text>
        <Text style={{ color:C.gray, fontSize:13, marginBottom:26 }}>Entre na sua conta Brazalive</Text>
        <Campo label="Email" placeholder="seu@email.com" value={email} onChange={setEmail} keyboard="email-address" icon="mail-outline" />
        <Campo label="Senha" placeholder="Sua senha" value={senha} onChange={setSenha} secure icon="lock-closed-outline" />
        <Btn label="Entrar" onPress={entrar} loading={loading} style={{ marginTop:8 }} />
        <Pressable style={{ marginTop:18, alignItems:'center' }} onPress={onCadastro}>
          <Text style={{ color:C.gray, fontSize:13 }}>
            {'Não tem conta? '}
            <Text style={{ color:C.red, fontWeight:'700' }}>Criar agora</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Cadastro({ onBack }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const [loading, setLoading] = useState(false);

  async function criar() {
    if (!email.trim() || !senha || !conf) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (senha.length < 8) {
      Alert.alert('Senha fraca', 'Mínimo 8 caracteres');
      return;
    }
    if (senha !== conf) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem');
      return;
    }
    setLoading(true);
    const { error } = await db.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }
    Alert.alert('Conta criada!', 'Verifique seu email para ativar a conta.', [{ text:'OK', onPress:onBack }]);
  }

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.bg }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <Header titulo="Criar conta" onBack={onBack} />
      <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:'center', padding:22, paddingBottom:insets.bottom+20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color:C.white, fontSize:24, fontWeight:'900', marginBottom:4 }}>Criar conta grátis 🇧🇷</Text>
        <Text style={{ color:C.gray, fontSize:13, marginBottom:26 }}>Junte-se ao Brazalive hoje</Text>
        <Campo label="Email" placeholder="seu@email.com" value={email} onChange={setEmail} keyboard="email-address" icon="mail-outline" />
        <Campo label="Senha" placeholder="Mínimo 8 caracteres" value={senha} onChange={setSenha} secure icon="lock-closed-outline" />
        <Campo label="Confirmar senha" placeholder="Repita a senha" value={conf} onChange={setConf} secure icon="shield-checkmark-outline" />
        <Btn label="Criar conta grátis" onPress={criar} loading={loading} style={{ marginTop:8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// BLOCO 4: Live Screen (feed + player)

function LiveFeed({ userId, onVerLive }) {
  const insets = useSafeAreaInsets();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await db.from('hosts')
      .select('*')
      .eq('status', 'active')
      .eq('is_online', true)
      .order('created_at', { ascending:false })
      .limit(30);
    setHosts(data || []);
    setLoading(false);
    setRefresh(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <View style={{ paddingTop:insets.top+8, paddingBottom:10, paddingHorizontal:16, backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <Logo size={24} />
        <Pressable hitSlop={10}><Ionicons name="notifications-outline" size={22} color={C.white} /></Pressable>
      </View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator size="large" color={C.red} />
          </View>
        : <FlatList
            data={hosts}
            numColumns={2}
            contentContainerStyle={{ padding:12 }}
            columnWrapperStyle={{ gap:10 }}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); carregar(); }} tintColor={C.red} />}
            ListHeaderComponent={
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <Text style={{ color:C.white, fontSize:16, fontWeight:'800' }}>🔴 Ao vivo agora</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
                  <View style={{ width:6, height:6, borderRadius:3, backgroundColor:C.red }} />
                  <Text style={{ color:C.gray, fontSize:12 }}>{hosts.length} online</Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <Vazio emoji="📺" titulo="Nenhuma live agora" sub="Volte mais tarde ou seja a primeira host!" />
            }
            renderItem={({ item, index }) => (
              <Pressable onPress={() => onVerLive(item)} style={{ width:'48%', height:200, borderRadius:16, backgroundColor:C.s2, overflow:'hidden', borderWidth:1, borderColor:C.border }}>
                <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:54 }}>{av(index)}</Text>
                </View>
                <View style={{ position:'absolute', top:8, left:8 }}>
                  <View style={{ backgroundColor:C.red, borderRadius:6, paddingHorizontal:7, paddingVertical:3 }}>
                    <Text style={{ color:C.white, fontSize:9, fontWeight:'800' }}>AO VIVO</Text>
                  </View>
                </View>
                <View style={{ padding:10, backgroundColor:'rgba(0,0,0,0.65)' }}>
                  <Text style={{ color:C.white, fontSize:13, fontWeight:'700' }} numberOfLines={1}>{item.display_name}</Text>
                  <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:1 }} numberOfLines={1}>{(item.categories||[]).join(', ') || 'Live'}</Text>
                </View>
              </Pressable>
            )}
          />
      }
    </View>
  );
}

function LivePlayer({ host, userId, onBack }) {
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [giftsV, setGiftsV] = useState(false);
  const [giftAnim, setGiftAnim] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [seguindo, setSeguindo] = useState(false);
  const scrollRef = useRef(null);
  const chName = 'bz_' + (host.user_id || host.id);

  function addMsg(m) {
    setMsgs(p => [...p.slice(-15), { id:Date.now(), ...m }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated:true }), 80);
  }

  useEffect(() => {
    // Presence real via Supabase
    const ch = db.channel('presence_' + chName);
    ch.on('presence', { event:'sync' }, () => {
      setViewers(Object.keys(ch.presenceState()).length);
    }).subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ user_id:userId, role:'viewer' });
      }
    });
    return () => { ch.untrack().then(() => db.removeChannel(ch)); };
  }, []);

  async function toggleSeguir() {
    if (!userId) return;
    const uid = host.user_id || host.id;
    if (seguindo) {
      await db.from('follows').delete().eq('follower_id', userId).eq('following_id', uid);
    } else {
      await db.from('follows').insert({ follower_id:userId, following_id:uid });
    }
    setSeguindo(s => !s);
  }

  async function enviarGift(gift) {
    if (!userId) return;
    const { error } = await db.rpc('send_gift', {
      p_sender_id: userId,
      p_receiver_id: host.user_id || host.id,
      p_gift_id: gift.id,
      p_gift_name: gift.name,
      p_gift_emoji: gift.emoji,
      p_coins: gift.coins,
    });
    if (error) { Alert.alert('Saldo insuficiente'); return; }
    addMsg({ u:'Você', t:'enviou ' + gift.name + ' ' + gift.emoji, c:C.gold });
    setGiftAnim(gift);
  }

  function enviarMsg() {
    if (!texto.trim()) return;
    addMsg({ u:'Você', t:texto.trim(), c:C.white, meu:true });
    setTexto('');
  }

  const webHtml = '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0}body{background:#1a0028;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}</style></head><body><div id="v" style="width:100%;height:100%;position:absolute"></div><script src="https://cdn.agora.io/sdk/web/AgoraRTC_N-production.js"></script><script>const c=AgoraRTC.createClient({mode:"live",codec:"vp8"});c.setClientRole("audience");c.join("' + AGORA_ID + '","' + chName + '",null,' + Math.floor(Math.random()*9999) + ').then(()=>{c.on("user-published",async(u,t)=>{await c.subscribe(u,t);if(t==="video")u.videoTrack.play("v");if(t==="audio")u.audioTrack.play();});}).catch(()=>{});</script></body></html>';

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:'#000' }} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={StyleSheet.absoluteFillObject}>
        <WebView source={{ html:webHtml }} style={StyleSheet.absoluteFillObject} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} javaScriptEnabled originWhitelist={['*']} />
      </View>
      {/* Header */}
      <View style={{ position:'absolute', top:0, left:0, right:0, paddingTop:insets.top+8, paddingHorizontal:12, paddingBottom:8 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
          <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.55)', borderRadius:28, padding:5, paddingRight:12, gap:8 }}>
            <Avatar emoji={av(0)} size={36} online />
            <View style={{ flex:1 }}>
              <Text style={{ color:C.white, fontSize:13, fontWeight:'700' }} numberOfLines={1}>{host.display_name}</Text>
            </View>
            <Pressable onPress={toggleSeguir} style={{ backgroundColor:seguindo?C.s2:C.red, borderRadius:15, paddingHorizontal:13, paddingVertical:5, borderWidth:seguindo?1:0, borderColor:C.border }}>
              <Text style={{ color:C.white, fontSize:12, fontWeight:'700' }}>{seguindo?'Seguindo':'+ Seguir'}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.55)', borderRadius:16, paddingHorizontal:10, paddingVertical:6, gap:5 }}>
            <View style={{ width:5, height:5, borderRadius:3, backgroundColor:C.red }} />
            <Text style={{ color:C.white, fontSize:13, fontWeight:'700' }}>{viewers || '—'}</Text>
          </View>
          <Pressable onPress={onBack} style={{ width:32, height:32, borderRadius:16, backgroundColor:'rgba(0,0,0,0.55)', alignItems:'center', justifyContent:'center' }}>
            <Ionicons name="close" size={17} color={C.white} />
          </Pressable>
        </View>
      </View>
      {/* Chat */}
      <View style={{ position:'absolute', left:10, right:70, bottom:insets.bottom+56, maxHeight:220 }}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          {msgs.map(m => (
            <View key={m.id} style={{ marginBottom:4 }}>
              <View style={{ alignSelf:'flex-start', backgroundColor:'rgba(0,0,0,0.5)', paddingHorizontal:9, paddingVertical:5, borderRadius:13, borderLeftWidth:m.meu?2:0, borderLeftColor:C.red }}>
                <Text style={{ color:m.c, fontSize:11, fontWeight:'700' }}>{m.u}</Text>
                <Text style={{ color:C.white, fontSize:13 }}>{m.t}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* Botões direita */}
      <View style={{ position:'absolute', right:10, bottom:insets.bottom+62, alignItems:'center', gap:14 }}>
        <Pressable onPress={toggleSeguir} style={{ width:46, height:46, borderRadius:23, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name={seguindo?'heart':'heart-outline'} size={23} color={seguindo?C.red:C.white} />
        </Pressable>
        <Pressable onPress={() => setGiftsV(true)} style={{ width:46, height:46, borderRadius:23, backgroundColor:'rgba(255,46,63,0.5)', alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:22 }}>🎁</Text>
        </Pressable>
      </View>
      {/* Input */}
      <View style={{ position:'absolute', left:0, right:0, bottom:0, paddingBottom:Math.max(insets.bottom,8)+4, paddingTop:8, paddingHorizontal:12, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'rgba(0,0,0,0.55)' }}>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:22, paddingHorizontal:14, paddingVertical:8 }}>
          <TextInput style={{ flex:1, color:C.white, fontSize:14, padding:0 }} placeholder="Escrever..." placeholderTextColor="rgba(255,255,255,0.4)" value={texto} onChangeText={setTexto} returnKeyType="send" onSubmitEditing={enviarMsg} blurOnSubmit />
          {texto.trim() ? <Pressable onPress={enviarMsg}><Ionicons name="send" size={17} color={C.red} /></Pressable> : null}
        </View>
        <Pressable onPress={() => setGiftsV(true)} style={{ width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,46,63,0.4)', alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:20 }}>🎁</Text>
        </Pressable>
      </View>
      {giftAnim && <GiftAnim gift={giftAnim} onFim={() => setGiftAnim(null)} />}
      <PainelGifts visible={giftsV} onClose={() => setGiftsV(false)} onEnviar={enviarGift} />
    </KeyboardAvoidingView>
  );
}

// BLOCO 5: Chat

function ChatLista({ userId, onAbrirConv }) {
  const insets = useSafeAreaInsets();
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    if (!userId) return;
    const { data } = await db.from('conversations')
      .select('*')
      .or('user1_id.eq.' + userId + ',user2_id.eq.' + userId)
      .order('last_message_at', { ascending:false });
    setConvs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
    const ch = db.channel('convs_' + userId)
      .on('postgres_changes', { event:'*', schema:'public', table:'conversations' }, carregar)
      .subscribe();
    return () => db.removeChannel(ch);
  }, [userId]);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <View style={{ paddingTop:insets.top+8, paddingBottom:10, paddingHorizontal:16, backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border }}>
        <Logo size={22} />
      </View>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator size="large" color={C.red} />
          </View>
        : <FlatList
            data={convs}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Vazio emoji="💬" titulo="Nenhuma conversa" sub="Visite o perfil de uma host e comece a conversar!" />}
            renderItem={({ item, index }) => {
              const outraId = item.user1_id === userId ? item.user2_id : item.user1_id;
              return (
                <Pressable onPress={() => onAbrirConv({ ...item, outraId })} style={{ flexDirection:'row', alignItems:'center', padding:15, borderBottomWidth:1, borderBottomColor:C.border }}>
                  <Avatar emoji={av(index)} size={48} online />
                  <View style={{ flex:1, marginLeft:12 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                      <Text style={{ color:C.white, fontSize:14, fontWeight:'700' }} numberOfLines={1}>{outraId.slice(0,8)}</Text>
                      <Text style={{ color:C.muted, fontSize:11 }}>{fmtH(item.last_message_at)}</Text>
                    </View>
                    <Text style={{ color:C.gray, fontSize:12, marginTop:2 }} numberOfLines={1}>{item.last_message || 'Nova conversa'}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
      }
    </View>
  );
}

function Conversa({ conv, userId, onBack }) {
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [giftsV, setGiftsV] = useState(false);
  const [fotoModal, setFotoModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [desbloq, setDesbloq] = useState(new Set());
  const [outroDigitando, setOutroDigitando] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    db.from('hosts').select('id').eq('user_id', userId).eq('status', 'active').maybeSingle()
      .then(({ data }) => setIsHost(!!data));
    db.from('photo_unlocks').select('message_id, expires_at').eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return;
        const s = new Set();
        data.forEach(r => { if (r.expires_at && new Date(r.expires_at) > new Date()) s.add(r.message_id); });
        setDesbloq(s);
      });
    if (!conv.id) return () => { ScreenCapture.allowScreenCaptureAsync().catch(() => {}); };
    db.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending:true })
      .then(({ data }) => { if (data) setMsgs(data); });
    const ch = db.channel('msgs_' + conv.id)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:'conversation_id=eq.' + conv.id },
        p => { setMsgs(prev => [...prev, p.new]); setTimeout(() => scrollRef.current?.scrollToEnd({ animated:true }), 100); })
      .subscribe();
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
      db.removeChannel(ch);
    };
  }, [conv.id]);

  async function enviar() {
    if (!texto.trim() || !conv.id) return;
    const txt = texto.trim();
    setTexto('');
    await db.from('messages').insert({ conversation_id:conv.id, sender_id:userId, content:txt, type:'text' });
    await db.from('conversations').update({ last_message:txt, last_message_at:new Date().toISOString() }).eq('id', conv.id);
  }

  async function enviarFoto(tipo) {
    setFotoModal(false);
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsEditing:true, quality:0.8 });
    if (r.canceled || !conv.id) return;
    setEnviando(true);
    try {
      const blob = await fetch(r.assets[0].uri).then(x => x.blob());
      const path = conv.id + '/' + Date.now() + '.jpg';
      const { error } = await db.storage.from('chat-photos').upload(path, blob, { contentType:'image/jpeg' });
      if (error) throw error;
      const { data:ud } = db.storage.from('chat-photos').getPublicUrl(path);
      await db.from('messages').insert({ conversation_id:conv.id, sender_id:userId, content:ud.publicUrl, type:tipo });
      await db.from('conversations').update({ last_message:tipo==='photo_private'?'🔒 Foto privada':'📷 Foto', last_message_at:new Date().toISOString() }).eq('id', conv.id);
    } catch (e) { Alert.alert('Erro', e.message); }
    setEnviando(false);
  }

  async function enviarGift(gift) {
    setGiftsV(false);
    if (!conv.id || !conv.outraId) return;
    const { error } = await db.rpc('send_gift', {
      p_sender_id: userId,
      p_receiver_id: conv.outraId,
      p_gift_id: gift.id,
      p_gift_name: gift.name,
      p_gift_emoji: gift.emoji,
      p_coins: gift.coins,
      p_conv_id: conv.id,
    });
    if (error) { Alert.alert('Saldo insuficiente'); return; }
    const c = JSON.stringify({ gift_id:gift.id, gift_name:gift.name, gift_emoji:gift.emoji, coins:gift.coins });
    await db.from('messages').insert({ conversation_id:conv.id, sender_id:userId, content:c, type:'gift' });
    await db.from('conversations').update({ last_message:'🎁 ' + gift.name, last_message_at:new Date().toISOString() }).eq('id', conv.id);
  }

  async function desbloquear(msg) {
    const preco = 1000;
    const { error } = await db.rpc('spend_coins', { p_user_id:userId, p_amount:preco, p_description:'Foto privada', p_type:'photo_unlock' });
    if (error) { Alert.alert('Saldo insuficiente'); return; }
    const exp = new Date(Date.now() + 15*60*1000).toISOString();
    await db.from('photo_unlocks').upsert({ user_id:userId, message_id:msg.id, coins_spent:preco, expires_at:exp });
    setDesbloq(p => new Set([...p, msg.id]));
    if (conv.outraId) {
      await db.rpc('earn_coins', { p_user_id:conv.outraId, p_amount:550, p_description:'Foto privada vendida', p_type:'photo_sale' }).catch(() => {});
    }
  }

  function renderMsg(m, i) {
    const minha = m.sender_id === userId;
    const agrup = i > 0 && msgs[i-1].sender_id === m.sender_id;
    if (m.type === 'gift') {
      let g = {};
      try { g = JSON.parse(m.content); } catch {}
      return (
        <View key={m.id} style={{ alignItems:'center', marginVertical:8 }}>
          <View style={{ backgroundColor:'rgba(255,180,0,0.1)', borderRadius:14, paddingHorizontal:18, paddingVertical:10, borderWidth:1, borderColor:'rgba(255,180,0,0.3)', alignItems:'center' }}>
            <Text style={{ fontSize:36 }}>{g.gift_emoji}</Text>
            <Text style={{ color:C.gold, fontSize:13, fontWeight:'800', marginTop:5 }}>{g.gift_name}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:4, marginTop:3 }}>
              <Moeda size={11} /><Text style={{ color:C.gold, fontSize:11 }}>{fmt(g.coins)}</Text>
            </View>
          </View>
        </View>
      );
    }
    if (m.type === 'photo_free' || m.type === 'photo_private') {
      const priv = m.type === 'photo_private';
      const livre = !priv || minha || desbloq.has(m.id);
      return (
        <View key={m.id} style={[{ marginBottom:3, marginTop:agrup?2:10 }, minha?{ alignItems:'flex-end' }:{ alignItems:'flex-start' }]}>
          <View style={{ borderRadius:14, overflow:'hidden', width:190, height:210 }}>
            {livre
              ? <Image source={{ uri:m.content }} style={{ width:190, height:210 }} resizeMode="cover" />
              : <View style={{ width:190, height:210, backgroundColor:C.s2, alignItems:'center', justifyContent:'center' }}>
                  <Image source={{ uri:m.content }} style={{ width:190, height:210, position:'absolute', opacity:0.06 }} blurRadius={28} />
                  <Text style={{ fontSize:40 }}>🔒</Text>
                  <Text style={{ color:C.white, fontSize:13, fontWeight:'800', marginTop:9 }}>Foto privada</Text>
                  <Pressable onPress={() => desbloquear(m)} style={{ backgroundColor:C.red, borderRadius:18, paddingHorizontal:18, paddingVertical:9, marginTop:12, flexDirection:'row', alignItems:'center', gap:6 }}>
                    <Text style={{ color:C.white, fontWeight:'800' }}>1.000 coins</Text>
                  </Pressable>
                </View>
            }
          </View>
        </View>
      );
    }
    return (
      <View key={m.id} style={[{ marginBottom:2, marginTop:agrup?2:10 }, minha?{ alignItems:'flex-end' }:{ alignItems:'flex-start' }]}>
        <View style={[{ maxWidth:'74%', paddingHorizontal:13, paddingVertical:9, borderRadius:18 }, minha?{ backgroundColor:C.red, borderBottomRightRadius:3 }:{ backgroundColor:C.s2, borderBottomLeftRadius:3 }]}>
          <Text style={{ color:C.white, fontSize:14, lineHeight:21 }}>{m.content}</Text>
        </View>
        <Text style={{ color:C.muted, fontSize:9, marginTop:2, marginHorizontal:4 }}>{fmtH(m.created_at)}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':'height'}>
        <View style={{ paddingTop:insets.top+6, paddingBottom:11, paddingHorizontal:15, backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
            <Pressable onPress={onBack} hitSlop={10}><Ionicons name="arrow-back" size={22} color={C.white} /></Pressable>
            <Avatar emoji={av(0)} size={38} online />
            <View style={{ flex:1 }}>
              <Text style={{ color:C.white, fontSize:14, fontWeight:'700' }}>Chat</Text>
              <Text style={{ color:outroDigitando?C.green:C.muted, fontSize:11 }}>{outroDigitando?'digitando...':'online'}</Text>
            </View>
          </View>
        </View>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding:15, paddingBottom:8 }} showsVerticalScrollIndicator={false}>
          {msgs.map((m, i) => renderMsg(m, i))}
        </ScrollView>
        <View style={{ backgroundColor:C.s1, borderTopWidth:1, borderTopColor:C.border, paddingTop:9, paddingHorizontal:13, paddingBottom:Math.max(insets.bottom,10)+3 }}>
          <View style={{ flexDirection:'row', alignItems:'flex-end', gap:9 }}>
            {isHost && (
              <Pressable onPress={() => setFotoModal(true)} hitSlop={10} disabled={enviando}>
                {enviando ? <ActivityIndicator size="small" color={C.red} /> : <Ionicons name="camera" size={23} color={C.red} />}
              </Pressable>
            )}
            <TextInput
              style={{ flex:1, backgroundColor:C.s2, borderRadius:21, paddingHorizontal:15, paddingVertical:9, color:C.white, fontSize:14, maxHeight:95, borderWidth:1, borderColor:C.border }}
              placeholder="Mensagem..."
              placeholderTextColor={C.muted}
              value={texto}
              onChangeText={setTexto}
              multiline
            />
            <Pressable onPress={() => setGiftsV(true)} hitSlop={10}><Text style={{ fontSize:22 }}>🎁</Text></Pressable>
            {texto.trim()
              ? <Pressable onPress={enviar} style={{ width:38, height:38, borderRadius:19, backgroundColor:C.red, alignItems:'center', justifyContent:'center' }}>
                  <Ionicons name="send" size={17} color={C.white} />
                </Pressable>
              : null
            }
          </View>
        </View>
      </KeyboardAvoidingView>
      <Modal visible={fotoModal} transparent animationType="slide" onRequestClose={() => setFotoModal(false)}>
        <Pressable style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)' }} onPress={() => setFotoModal(false)} />
        <View style={{ backgroundColor:C.s1, borderTopLeftRadius:20, borderTopRightRadius:20, padding:22, paddingBottom:insets.bottom+18 }}>
          <Text style={{ color:C.white, fontSize:17, fontWeight:'800', textAlign:'center', marginBottom:18 }}>Enviar foto</Text>
          <Pressable onPress={() => enviarFoto('photo_free')} style={{ backgroundColor:C.s2, borderRadius:14, padding:16, marginBottom:11, flexDirection:'row', alignItems:'center', gap:13, borderWidth:1, borderColor:C.border }}>
            <Text style={{ fontSize:30 }}>📷</Text>
            <View style={{ flex:1 }}>
              <Text style={{ color:C.white, fontSize:14, fontWeight:'800' }}>Foto grátis</Text>
              <Text style={{ color:C.gray, fontSize:12, marginTop:2 }}>Todos podem ver</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => enviarFoto('photo_private')} style={{ backgroundColor:'rgba(255,180,0,0.07)', borderRadius:14, padding:16, flexDirection:'row', alignItems:'center', gap:13, borderWidth:1.5, borderColor:C.gold }}>
            <Text style={{ fontSize:30 }}>🔒</Text>
            <View style={{ flex:1 }}>
              <Text style={{ color:C.gold, fontSize:14, fontWeight:'800' }}>Foto privada</Text>
              <Text style={{ color:C.gray, fontSize:12, marginTop:2 }}>1.000 coins · 15 minutos</Text>
            </View>
          </Pressable>
        </View>
      </Modal>
      <PainelGifts visible={giftsV} onClose={() => setGiftsV(false)} onEnviar={enviarGift} />
    </View>
  );
}

// BLOCO 6: Host Live + Admin + Mim + Nav + Root

function HostLive({ host, user, onEnd }) {
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [viewers, setViewers] = useState(0);
  const [giftsV, setGiftsV] = useState(false);
  const [mudo, setMudo] = useState(false);
  const engRef = useRef(null);
  const scrollRef = useRef(null);
  const chName = 'bz_' + (host?.user_id || user.id);

  function addMsg(m) {
    setMsgs(p => [...p.slice(-14), { id:Date.now(), ...m }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated:true }), 80);
  }

  useEffect(() => {
    db.from('hosts').update({ is_online:true }).eq('user_id', user.id).then(() => {});
    db.from('lives').insert({ host_id:host?.id, title:(host?.display_name||'Live'), channel_name:chName, status:'live', viewers_count:0 }).then(() => {});
    const pres = db.channel('presence_' + chName);
    pres.on('presence', { event:'sync' }, () => { setViewers(Object.keys(pres.presenceState()).length - 1); })
      .subscribe(async s => { if (s==='SUBSCRIBED') await pres.track({ user_id:user.id, role:'host' }); });
    if (AGORA_OK) {
      const eng = RNAgora.createAgoraRtcEngine();
      eng.initialize({ appId:AGORA_ID });
      eng.enableVideo();
      eng.enableAudio();
      eng.setChannelProfile(RNAgora.ChannelProfileType.ChannelProfileLiveBroadcasting);
      eng.setClientRole(RNAgora.ClientRoleType.ClientRoleBroadcaster);
      eng.addListener('onConnectionStateChanged', (state) => {
        if (state === 4) {
          setTimeout(() => { eng.leaveChannel(); eng.joinChannel('', chName, 0, { clientRoleType:RNAgora.ClientRoleType.ClientRoleBroadcaster }); }, 3000);
        }
      });
      eng.joinChannel('', chName, 0, { clientRoleType:RNAgora.ClientRoleType.ClientRoleBroadcaster });
      eng.startPreview();
      engRef.current = eng;
    }
    return () => {
      pres.untrack().then(() => db.removeChannel(pres));
      db.from('hosts').update({ is_online:false }).eq('user_id', user.id).then(() => {});
      db.from('lives').update({ status:'ended', ended_at:new Date().toISOString() }).eq('channel_name', chName).then(() => {});
      if (engRef.current) { engRef.current.leaveChannel(); engRef.current.release(); }
    };
  }, []);

  function encerrar() {
    Alert.alert('Encerrar live?', '', [
      { text:'Cancelar', style:'cancel' },
      { text:'Encerrar', style:'destructive', onPress:onEnd },
    ]);
  }

  function enviarMsg() {
    if (!texto.trim()) return;
    addMsg({ u:'Você', t:texto.trim(), c:C.red });
    setTexto('');
  }

  const RtcSurface = AGORA_OK ? RNAgora.RtcSurfaceView : null;

  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {RtcSurface
        ? <RtcSurface style={StyleSheet.absoluteFillObject} canvas={{ uid:0 }} />
        : <View style={[StyleSheet.absoluteFillObject, { backgroundColor:'#1a0028', alignItems:'center', justifyContent:'center' }]}>
            <Text style={{ fontSize:80 }}>📹</Text>
            <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:14, marginTop:12 }}>Câmera ao vivo</Text>
          </View>
      }
      <View style={{ position:'absolute', top:insets.top+8, left:12, right:12, flexDirection:'row', alignItems:'center', gap:10 }}>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.6)', borderRadius:20, paddingHorizontal:14, paddingVertical:8, gap:8 }}>
          <View style={{ width:8, height:8, borderRadius:4, backgroundColor:C.red }} />
          <Text style={{ color:C.white, fontSize:13, fontWeight:'800' }}>AO VIVO</Text>
          <Text style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>{'👁 ' + viewers}</Text>
        </View>
        <Pressable onPress={() => { setMudo(m => !m); engRef.current?.muteLocalAudioStream(!mudo); }} style={{ width:40, height:40, borderRadius:20, backgroundColor:mudo?C.red:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name={mudo?'mic-off':'mic'} size={20} color={C.white} />
        </Pressable>
        <Pressable onPress={encerrar} style={{ backgroundColor:C.red, borderRadius:20, paddingHorizontal:16, paddingVertical:8 }}>
          <Text style={{ color:C.white, fontSize:13, fontWeight:'800' }}>Encerrar</Text>
        </Pressable>
      </View>
      <View style={{ position:'absolute', left:10, right:10, bottom:insets.bottom+58, maxHeight:200 }}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          {msgs.map(m => (
            <View key={m.id} style={{ marginBottom:4 }}>
              <View style={{ alignSelf:'flex-start', backgroundColor:'rgba(0,0,0,0.55)', paddingHorizontal:10, paddingVertical:5, borderRadius:12 }}>
                <Text style={{ color:m.c||C.white, fontSize:13 }}>{m.u + ': ' + m.t}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={{ position:'absolute', left:0, right:0, bottom:0, paddingBottom:Math.max(insets.bottom,8)+4, paddingTop:8, paddingHorizontal:12, flexDirection:'row', gap:8, backgroundColor:'rgba(0,0,0,0.6)' }}>
        <TextInput style={{ flex:1, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:22, paddingHorizontal:14, paddingVertical:8, color:C.white, fontSize:14 }} placeholder="Responder chat..." placeholderTextColor="rgba(255,255,255,0.4)" value={texto} onChangeText={setTexto} returnKeyType="send" onSubmitEditing={enviarMsg} />
        {texto.trim() ? <Pressable onPress={enviarMsg} style={{ width:38, height:38, borderRadius:19, backgroundColor:C.red, alignItems:'center', justifyContent:'center' }}><Ionicons name="send" size={17} color={C.white} /></Pressable> : null}
      </View>
    </View>
  );
}

// ── ADMIN ─────────────────────────────────────────────────────
function AdminPanel({ user, onBack }) {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState('dash');
  const [dados, setDados] = useState({ hosts:[], users:[], pags:[], saques:[] });
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const [h, u, p, s] = await Promise.all([
      db.from('hosts').select('*').order('created_at', { ascending:false }).then(r => r.data||[]),
      db.from('profiles').select('*').order('created_at', { ascending:false }).limit(100).then(r => r.data||[]),
      db.from('coin_purchases').select('*').order('created_at', { ascending:false }).then(r => r.data||[]),
      db.from('withdrawals').select('*').order('created_at', { ascending:false }).then(r => r.data||[]).catch(() => []),
    ]);
    setDados({ hosts:h, users:u, pags:p, saques:s });
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function aprovar(id) {
    await db.from('hosts').update({ status:'active', approved_at:new Date().toISOString() }).eq('id', id);
    setDados(d => ({ ...d, hosts:d.hosts.map(h => h.id===id?{ ...h, status:'active' }:h) }));
    Alert.alert('Host aprovada!');
  }

  async function rejeitar(id) {
    await db.from('hosts').update({ status:'rejected' }).eq('id', id);
    setDados(d => ({ ...d, hosts:d.hosts.map(h => h.id===id?{ ...h, status:'rejected' }:h) }));
  }

  async function confirmarPix(p) {
    await db.from('coin_purchases').update({ status:'confirmed', confirmed_at:new Date().toISOString() }).eq('id', p.id);
    await db.rpc('earn_coins', { p_user_id:p.user_id, p_amount:p.coins_amount+(p.bonus_amount||0), p_description:'Compra de coins confirmada', p_type:'purchase' });
    setDados(d => ({ ...d, pags:d.pags.map(x => x.id===p.id?{ ...x, status:'confirmed' }:x) }));
    Alert.alert('Coins creditados!');
  }

  async function pagarSaque(s) {
    await db.from('withdrawals').update({ status:'paid', paid_at:new Date().toISOString() }).eq('id', s.id);
    setDados(d => ({ ...d, saques:d.saques.map(x => x.id===s.id?{ ...x, status:'paid' }:x) }));
    Alert.alert('Saque pago!');
  }

  const ABAS = [
    { k:'dash', l:'Dash' },
    { k:'hosts', l:'Hosts (' + dados.hosts.filter(h=>h.status==='pending').length + ')' },
    { k:'users', l:'Users' },
    { k:'pix', l:'Pix (' + dados.pags.filter(p=>p.status==='pending').length + ')' },
    { k:'saques', l:'Saques' },
  ];

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <View style={{ paddingTop:insets.top+8, paddingBottom:10, paddingHorizontal:16, backgroundColor:C.s1, borderBottomWidth:1, borderBottomColor:C.border, flexDirection:'row', alignItems:'center', gap:10 }}>
        <Pressable onPress={onBack} hitSlop={10}><Ionicons name="arrow-back" size={22} color={C.white} /></Pressable>
        <Text style={{ flex:1, color:C.white, fontSize:16, fontWeight:'800' }}>Painel Admin</Text>
        <Pressable onPress={carregar} hitSlop={10}><Ionicons name="refresh" size={20} color={C.gray} /></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:12, paddingVertical:10, gap:8 }}>
        {ABAS.map(a => (
          <Pressable key={a.k} onPress={() => setAba(a.k)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:aba===a.k?C.red:C.border, backgroundColor:aba===a.k?'rgba(255,46,63,0.1)':C.s1 }}>
            <Text style={{ color:aba===a.k?C.red:C.gray, fontSize:12, fontWeight:aba===a.k?'700':'400' }}>{a.l}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {loading
        ? <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator size="large" color={C.red} /></View>
        : <ScrollView contentContainerStyle={{ padding:14, paddingBottom:40 }}>
            {aba==='dash' && (
              <View>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:18 }}>
                  {[
                    [dados.users.length, 'Usuários', C.red],
                    [dados.hosts.filter(h=>h.status==='active').length, 'Hosts ativas', C.green],
                    [dados.hosts.filter(h=>h.status==='pending').length, 'Pendentes', C.gold],
                  ].map(([v,l,cor]) => (
                    <View key={l} style={{ backgroundColor:C.s1, borderRadius:13, padding:15, borderWidth:1, borderColor:C.border, borderTopWidth:3, borderTopColor:cor, width:'47%' }}>
                      <Text style={{ color:cor, fontSize:22, fontWeight:'900' }}>{v}</Text>
                      <Text style={{ color:C.muted, fontSize:11, marginTop:4 }}>{l}</Text>
                    </View>
                  ))}
                </View>
                {dados.hosts.filter(h=>h.status==='pending').map(h => (
                  <View key={h.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                    <Text style={{ color:C.gold, fontSize:10, fontWeight:'800', marginBottom:6 }}>HOST PENDENTE</Text>
                    <Text style={{ color:C.white, fontSize:15, fontWeight:'700' }}>{h.display_name}</Text>
                    <Text style={{ color:C.gray, fontSize:12, marginTop:2 }}>Pix: {h.pix_key}</Text>
                    <View style={{ flexDirection:'row', gap:9, marginTop:11 }}>
                      <Pressable onPress={() => aprovar(h.id)} style={{ flex:1, backgroundColor:'rgba(34,197,94,0.12)', borderRadius:9, padding:11, alignItems:'center', borderWidth:1, borderColor:'rgba(34,197,94,0.3)' }}>
                        <Text style={{ color:C.green, fontWeight:'700' }}>Aprovar</Text>
                      </Pressable>
                      <Pressable onPress={() => rejeitar(h.id)} style={{ flex:1, backgroundColor:'rgba(255,46,63,0.1)', borderRadius:9, padding:11, alignItems:'center', borderWidth:1, borderColor:'rgba(255,46,63,0.3)' }}>
                        <Text style={{ color:C.red, fontWeight:'700' }}>Rejeitar</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
                {dados.pags.filter(p=>p.status==='pending').map(p => (
                  <View key={p.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                    <Text style={{ color:C.blue, fontSize:10, fontWeight:'800', marginBottom:5 }}>PIX PENDENTE</Text>
                    <Text style={{ color:C.white, fontSize:17, fontWeight:'900' }}>R$ {Number(p.price_brl||0).toFixed(2)}</Text>
                    <Text style={{ color:C.gray, fontSize:12, marginTop:2 }}>{fmt(p.coins_amount)} + {fmt(p.bonus_amount||0)} coins</Text>
                    <Pressable onPress={() => confirmarPix(p)} style={{ backgroundColor:C.blue, borderRadius:9, padding:11, alignItems:'center', marginTop:11 }}>
                      <Text style={{ color:C.white, fontWeight:'800' }}>Confirmar Pix</Text>
                    </Pressable>
                  </View>
                ))}
                {dados.saques.filter(s=>s.status==='pending').map(s => (
                  <View key={s.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                    <Text style={{ color:C.green, fontSize:10, fontWeight:'800', marginBottom:5 }}>SAQUE PENDENTE</Text>
                    <Text style={{ color:C.green, fontSize:17, fontWeight:'900' }}>R$ {Number(s.amount_brl||0).toFixed(2)}</Text>
                    <Text style={{ color:C.gray, fontSize:12, marginTop:2 }}>Pix: {s.pix_key}</Text>
                    <Pressable onPress={() => pagarSaque(s)} style={{ backgroundColor:C.green, borderRadius:9, padding:11, alignItems:'center', marginTop:11 }}>
                      <Text style={{ color:C.white, fontWeight:'800' }}>Confirmar pagamento</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            {aba==='hosts' && dados.hosts.map(h => (
              <View key={h.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 }}>
                  <Text style={{ color:C.white, fontSize:15, fontWeight:'700' }}>{h.display_name}</Text>
                  <View style={{ backgroundColor:h.status==='active'?'rgba(34,197,94,0.15)':h.status==='pending'?'rgba(255,184,0,0.15)':'rgba(255,46,63,0.15)', borderRadius:8, paddingHorizontal:9, paddingVertical:4 }}>
                    <Text style={{ color:h.status==='active'?C.green:h.status==='pending'?C.gold:C.red, fontSize:10, fontWeight:'800' }}>{h.status}</Text>
                  </View>
                </View>
                <Text style={{ color:C.gray, fontSize:12 }}>CPF: {h.cpf}</Text>
                <Text style={{ color:C.gray, fontSize:12 }}>Pix: {h.pix_key_type} - {h.pix_key}</Text>
                {h.status==='pending' && (
                  <View style={{ flexDirection:'row', gap:9, marginTop:11 }}>
                    <Pressable onPress={() => aprovar(h.id)} style={{ flex:1, backgroundColor:'rgba(34,197,94,0.12)', borderRadius:9, padding:11, alignItems:'center', borderWidth:1, borderColor:'rgba(34,197,94,0.3)' }}>
                      <Text style={{ color:C.green, fontWeight:'700' }}>Aprovar</Text>
                    </Pressable>
                    <Pressable onPress={() => rejeitar(h.id)} style={{ flex:1, backgroundColor:'rgba(255,46,63,0.1)', borderRadius:9, padding:11, alignItems:'center', borderWidth:1, borderColor:'rgba(255,46,63,0.3)' }}>
                      <Text style={{ color:C.red, fontWeight:'700' }}>Rejeitar</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            {aba==='users' && dados.users.map((u, i) => (
              <View key={u.id} style={{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:12, padding:13, marginBottom:8, borderWidth:1, borderColor:C.border }}>
                <Avatar emoji={av(i)} size={36} />
                <View style={{ flex:1, marginLeft:11 }}>
                  <Text style={{ color:C.white, fontSize:13, fontWeight:'600' }}>{u.username || u.id?.slice(0,12)}</Text>
                  <Text style={{ color:C.gold, fontSize:10, marginTop:2 }}>{'🪙 ' + fmt(u.coins_balance||0)}</Text>
                </View>
              </View>
            ))}
            {aba==='pix' && dados.pags.map(p => (
              <View key={p.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:7 }}>
                  <Text style={{ color:C.white, fontSize:17, fontWeight:'900' }}>R$ {Number(p.price_brl||0).toFixed(2)}</Text>
                  <Text style={{ color:p.status==='confirmed'?C.green:C.gold, fontSize:12, fontWeight:'700' }}>{p.status}</Text>
                </View>
                <Text style={{ color:C.gray, fontSize:12 }}>{fmt(p.coins_amount)} + {fmt(p.bonus_amount||0)} coins</Text>
                {p.status==='pending' && (
                  <Pressable onPress={() => confirmarPix(p)} style={{ backgroundColor:C.blue, borderRadius:9, padding:11, alignItems:'center', marginTop:11 }}>
                    <Text style={{ color:C.white, fontWeight:'800' }}>Confirmar Pix</Text>
                  </Pressable>
                )}
              </View>
            ))}
            {aba==='saques' && dados.saques.map(s => (
              <View key={s.id} style={{ backgroundColor:C.s1, borderRadius:13, padding:14, marginBottom:10, borderWidth:1, borderColor:C.border }}>
                <Text style={{ color:C.green, fontSize:17, fontWeight:'900' }}>R$ {Number(s.amount_brl||0).toFixed(2)}</Text>
                <Text style={{ color:C.gray, fontSize:12, marginTop:4 }}>Pix: {s.pix_key}</Text>
                {s.status==='pending' && (
                  <Pressable onPress={() => pagarSaque(s)} style={{ backgroundColor:C.green, borderRadius:9, padding:11, alignItems:'center', marginTop:11 }}>
                    <Text style={{ color:C.white, fontWeight:'800' }}>Pagar</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>
      }
    </View>
  );
}


// ── CARTEIRA ─────────────────────────────────────────────────
function Carteira({ onBack, userId }) {
  const insets = useSafeAreaInsets();
  const [saldo, setSaldo] = useState(0);
  const [hist, setHist] = useState([]);
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    db.from('profiles').select('coins_balance').eq('id', userId).single().then(({ data }) => data && setSaldo(data.coins_balance||0));
    db.from('coin_transactions').select('*').eq('user_id', userId).order('created_at', { ascending:false }).limit(20)
      .then(({ data }) => { if (data) setHist(data); setLoading(false); });
  }, [userId]);

  async function comprar(p) {
    if (userId) {
      await db.from('coin_purchases').insert({ user_id:userId, coins_amount:p.coins, bonus_amount:p.bonus, price_brl:parseFloat(p.preco.replace('R$ ','').replace(',','.')), status:'pending', pix_key:'fs649588@gmail.com' });
    }
    setPacote(p);
  }

  async function solicitarSaque() {
    const { data:prof } = await db.from('profiles').select('coins_balance').eq('id', userId).single();
    if ((prof?.coins_balance||0) < MIN_SAQUE) { Alert.alert('Saldo insuficiente', 'Minimo de 50.000 coins (R$ 75,00)'); return; }
    const { data:host } = await db.from('hosts').select('pix_key').eq('user_id', userId).maybeSingle();
    if (!host?.pix_key) { Alert.alert('Pix nao cadastrado', 'Cadastre sua chave Pix no perfil de host'); return; }
    const valor = (prof.coins_balance / 1000 * CONV_RATE).toFixed(2);
    Alert.alert('Confirmar saque?', prof.coins_balance + ' coins - R$ ' + valor + ' | Pix: ' + host.pix_key, [
      { text:'Cancelar', style:'cancel' },
      { text:'Solicitar', onPress: async () => {
        await db.from('withdrawals').insert({ user_id:userId, coins_amount:prof.coins_balance, amount_brl:parseFloat(valor), pix_key:host.pix_key, status:'pending' });
        Alert.alert('Saque solicitado! Sera pago ate terca-feira.');
      }},
    ]);
  }

  if (pacote) return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header titulo="Pagar via Pix" onBack={() => setPacote(null)} />
      <ScrollView contentContainerStyle={{ padding:20, paddingBottom:40 }}>
        <View style={{ backgroundColor:C.s1, borderRadius:16, padding:26, alignItems:'center', marginBottom:14, borderWidth:1, borderColor:C.border }}>
          <Text style={{ fontSize:50 }}>🏦</Text>
          <Text style={{ color:C.white, fontSize:28, fontWeight:'900', marginTop:12 }}>{pacote.preco}</Text>
          <Text style={{ color:C.gray, fontSize:13, marginTop:4 }}>{fmt(pacote.coins)} + {fmt(pacote.bonus)} bonus coins</Text>
        </View>
        <View style={{ backgroundColor:C.s1, borderRadius:14, padding:18, marginBottom:12, borderWidth:1, borderColor:C.border }}>
          <Text style={{ color:C.white, fontSize:14, fontWeight:'700', marginBottom:11 }}>Como pagar:</Text>
          <Text style={{ color:C.gray, fontSize:13, lineHeight:24 }}>{"1. Abre seu app de banco\n2. Pix - Pagar\n3. Cola a chave abaixo\n4. Valor: " + pacote.preco}</Text>
        </View>
        <View style={{ backgroundColor:C.s1, borderRadius:14, padding:18, marginBottom:12, borderWidth:1, borderColor:C.border, alignItems:'center' }}>
          <Text style={{ color:C.gray, fontSize:12, marginBottom:6 }}>Chave Pix</Text>
          <Text style={{ color:C.white, fontSize:17, fontWeight:'800' }}>fs649588@gmail.com</Text>
        </View>
        <Btn label="Ja paguei" cor={C.green} onPress={() => { setPacote(null); Alert.alert('Pedido registrado!', 'Seus coins serao adicionados em breve.'); }} />
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <Header titulo="Carteira" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40 }}>
        <View style={{ backgroundColor:C.s1, borderRadius:16, padding:26, alignItems:'center', marginBottom:6, borderWidth:1, borderColor:C.border }}>
          <Text style={{ color:C.gray, fontSize:12, marginBottom:8 }}>Seu saldo</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:11 }}>
            <Moeda size={38} />
            <Text style={{ color:C.white, fontSize:48, fontWeight:'900' }}>{fmt(saldo)}</Text>
          </View>
          <Text style={{ color:C.gray, fontSize:13, marginTop:6 }}>{fmtR(saldo)}</Text>
        </View>
        {userId && (
          <Pressable onPress={solicitarSaque} style={{ backgroundColor:'rgba(34,197,94,0.1)', borderRadius:14, padding:16, marginTop:6, marginBottom:6, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:'rgba(34,197,94,0.3)' }}>
            <Ionicons name="cash-outline" size={22} color={C.green} />
            <View style={{ flex:1 }}>
              <Text style={{ color:C.green, fontSize:15, fontWeight:'800' }}>Solicitar saque</Text>
              <Text style={{ color:C.gray, fontSize:11, marginTop:2 }}>Min. 50.000 coins - Pix toda terca</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.green} />
          </Pressable>
        )}
        <Text style={{ color:C.white, fontSize:16, fontWeight:'800', marginTop:18, marginBottom:13 }}>Comprar Coins</Text>
        {PACOTES.map(p => (
          <Pressable key={p.id} onPress={() => comprar(p)} style={[{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:14, padding:15, marginBottom:9, borderWidth:1.5 }, p.hot?{ borderColor:C.red }:{ borderColor:C.border }]}>
            {p.hot && <View style={{ position:'absolute', top:-9, right:14, backgroundColor:C.red, borderRadius:7, paddingHorizontal:9, paddingVertical:3 }}><Text style={{ color:C.white, fontSize:9, fontWeight:'800' }}>POPULAR</Text></View>}
            <Moeda size={28} />
            <View style={{ flex:1, marginLeft:12 }}>
              <Text style={{ color:C.white, fontSize:15, fontWeight:'800' }}>{fmt(p.coins)}</Text>
              <Text style={{ color:C.green, fontSize:11, marginTop:2 }}>+{fmt(p.bonus)} bonus</Text>
            </View>
            <View style={[{ borderRadius:10, paddingHorizontal:14, paddingVertical:9 }, p.hot?{ backgroundColor:C.red }:{ backgroundColor:C.s2 }]}>
              <Text style={{ color:C.white, fontSize:13, fontWeight:'800' }}>{p.preco}</Text>
            </View>
          </Pressable>
        ))}
        {hist.length > 0 && (
          <>
            <Text style={{ color:C.white, fontSize:16, fontWeight:'800', marginTop:18, marginBottom:12 }}>Historico</Text>
            {hist.map(t => (
              <View key={t.id} style={{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:13, padding:13, marginBottom:9, borderWidth:1, borderColor:C.border }}>
                <Text style={{ fontSize:24, marginRight:12 }}>{t.amount>0?'💰':'🎁'}</Text>
                <View style={{ flex:1 }}>
                  <Text style={{ color:C.white, fontSize:12, fontWeight:'600' }}>{t.description}</Text>
                  <Text style={{ color:C.muted, fontSize:10, marginTop:2 }}>{fmtD(t.created_at)}</Text>
                </View>
                <Text style={{ color:t.amount>0?C.green:C.red, fontSize:14, fontWeight:'800' }}>{t.amount>0?'+':''}{fmt(t.amount)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── HOST CADASTRO ─────────────────────────────────────────────
function HostCadastro({ user, onBack, onOk }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const TOTAL = 5;
  const [d, setD] = useState({ aceiteTermos:false, aceiteIdade:false, display_name:'', real_name:'', cpf:'', birth_date:'', city:'', state:'', pix_key_type:'cpf', pix_key:'', bio:'', categories:[] });
  const upd = (k, v) => setD(p => ({ ...p, [k]:v }));

  function validar() {
    if (step===1 && (!d.aceiteTermos||!d.aceiteIdade)) { Alert.alert('Aceite os termos para continuar'); return false; }
    if (step===2 && (!d.display_name.trim()||!d.real_name.trim()||!d.cpf||!d.birth_date)) { Alert.alert('Preencha todos os campos'); return false; }
    if (step===3 && !d.pix_key.trim()) { Alert.alert('Informe sua chave Pix'); return false; }
    if (step===4 && (!d.bio.trim()||d.categories.length===0)) { Alert.alert('Preencha a bio e ao menos 1 categoria'); return false; }
    return true;
  }

  async function enviar() {
    if (!validar()) return;
    if (step < TOTAL) { setStep(step+1); return; }
    setLoading(true);
    try {
      const parts = d.birth_date.split('/');
      const bdate = parts[2] + '-' + parts[1] + '-' + parts[0];
      const { error } = await db.from('hosts').insert({ user_id:user.id, display_name:d.display_name.trim(), real_name:d.real_name.trim(), cpf:d.cpf.replace(/\D/g,''), birth_date:bdate, city:d.city.trim(), state:d.state.trim(), pix_key_type:d.pix_key_type, pix_key:d.pix_key.trim(), bio:d.bio.trim(), categories:d.categories, commission_rate:0.55, status:'pending' });
      if (error) throw error;
      setLoading(false);
      onOk();
    } catch(e) { setLoading(false); Alert.alert('Erro', e.message); }
  }

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.bg }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <Header titulo={'Cadastro host (' + step + '/' + TOTAL + ')'} onBack={() => step>1?setStep(step-1):onBack()} />
      <View style={{ paddingHorizontal:20, paddingVertical:10 }}>
        <View style={{ height:4, backgroundColor:C.s2, borderRadius:2 }}>
          <View style={{ height:4, width:((step/TOTAL)*100) + '%', backgroundColor:C.red, borderRadius:2 }} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:20, paddingBottom:insets.bottom+100 }} keyboardShouldPersistTaps="handled">
        {step===1 && (
          <View>
            <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginBottom:20 }}>Termos e condicoes</Text>
            {[{ k:'aceiteIdade', l:'Confirmo que tenho 18 anos ou mais' },{ k:'aceiteTermos', l:'Concordo com os Termos de Uso e comissao 55/45' }].map(item => (
              <Pressable key={item.k} onPress={() => upd(item.k, !d[item.k])} style={{ flexDirection:'row', alignItems:'flex-start', backgroundColor:C.s1, borderRadius:13, padding:15, marginBottom:11, borderWidth:1.5, borderColor:d[item.k]?C.green:C.border, gap:13 }}>
                <View style={{ width:22, height:22, borderRadius:5, borderWidth:2, borderColor:d[item.k]?C.green:C.muted, backgroundColor:d[item.k]?C.green:'transparent', alignItems:'center', justifyContent:'center' }}>
                  {d[item.k] ? <Ionicons name="checkmark" size={13} color={C.white} /> : null}
                </View>
                <Text style={{ flex:1, color:C.gray, fontSize:13, lineHeight:20 }}>{item.l}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {step===2 && (
          <View>
            <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginBottom:18 }}>Dados pessoais</Text>
            <Campo label="Nome artistico *" placeholder="Como quer ser chamada" value={d.display_name} onChange={v=>upd('display_name',v)} capWords />
            <Campo label="Nome completo *" placeholder="Seu nome real" value={d.real_name} onChange={v=>upd('real_name',v)} capWords />
            <Campo label="CPF *" placeholder="000.000.000-00" value={d.cpf} onChange={v=>upd('cpf',fmtCPF(v))} keyboard="numeric" />
            <Campo label="Nascimento *" placeholder="DD/MM/AAAA" value={d.birth_date} onChange={v=>upd('birth_date',fmtData(v))} keyboard="numeric" />
            <Campo label="Cidade" placeholder="Sao Paulo" value={d.city} onChange={v=>upd('city',v)} capWords />
            <Campo label="Estado" placeholder="SP" value={d.state} onChange={v=>upd('state',v.toUpperCase().slice(0,2))} />
          </View>
        )}
        {step===3 && (
          <View>
            <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginBottom:18 }}>Dados Pix</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {[['cpf','CPF'],['email','Email'],['telefone','Telefone'],['aleatoria','Aleatoria']].map(([v,l]) => (
                <Pressable key={v} onPress={() => upd('pix_key_type',v)} style={{ paddingHorizontal:16, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:d.pix_key_type===v?C.red:C.border, backgroundColor:d.pix_key_type===v?'rgba(255,46,63,0.1)':C.s1 }}>
                  <Text style={{ color:d.pix_key_type===v?C.red:C.gray, fontSize:13, fontWeight:d.pix_key_type===v?'700':'400' }}>{l}</Text>
                </Pressable>
              ))}
            </View>
            <Campo label="Chave Pix *" placeholder="Sua chave Pix" value={d.pix_key} onChange={v=>upd('pix_key',v)} icon="cash-outline" />
          </View>
        )}
        {step===4 && (
          <View>
            <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginBottom:18 }}>Perfil publico</Text>
            <Campo label="Bio *" placeholder="Fale sobre voce..." value={d.bio} onChange={v=>upd('bio',v.slice(0,150))} multiline maxLen={150} />
            <Text style={{ color:C.muted, fontSize:11, textAlign:'right', marginTop:-10, marginBottom:14 }}>{d.bio.length}/150</Text>
            <Text style={{ color:C.gray, fontSize:12, fontWeight:'600', marginBottom:10 }}>Categorias * (ate 3)</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:9 }}>
              {CATS.map(c => {
                const ativo = d.categories.includes(c);
                const bloq = d.categories.length >= 3 && !ativo;
                return (
                  <Pressable key={c} onPress={() => !bloq && upd('categories', ativo?d.categories.filter(x=>x!==c):[...d.categories,c])} style={{ paddingHorizontal:15, paddingVertical:9, borderRadius:20, borderWidth:1.5, borderColor:ativo?C.red:C.border, backgroundColor:ativo?'rgba(255,46,63,0.1)':C.s1, opacity:bloq?0.4:1 }}>
                    <Text style={{ color:ativo?C.red:C.gray, fontSize:13, fontWeight:ativo?'700':'400' }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {step===5 && (
          <View>
            <Text style={{ color:C.white, fontSize:20, fontWeight:'900', marginBottom:18 }}>Revisao</Text>
            {[['Nome artistico',d.display_name],['Nome real',d.real_name],['CPF',d.cpf],['Nascimento',d.birth_date],['Pix',d.pix_key_type+': '+d.pix_key],['Categorias',d.categories.join(', ')]].map(([k,v]) => (
              <View key={k} style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.border }}>
                <Text style={{ color:C.gray, fontSize:13 }}>{k}</Text>
                <Text style={{ color:C.white, fontSize:13, fontWeight:'600', maxWidth:'60%', textAlign:'right' }}>{v||'-'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={{ padding:20, paddingBottom:insets.bottom+14, borderTopWidth:1, borderTopColor:C.border }}>
        <Btn label={step===TOTAL?'Enviar candidatura':'Continuar'} onPress={enviar} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

// ── MIM ───────────────────────────────────────────────────────
function Mim({ user, onLogout }) {
  const [tela, setTela] = useState('main');
  const [profile, setProfile] = useState(null);
  const [hostStatus, setHostStatus] = useState(null);
  const [hostData, setHostData] = useState(null);
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (!user?.id) return;
    db.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => data && setProfile(data));
    db.from('hosts').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => { if (data) { setHostStatus(data.status); setHostData(data); } });
  }, [user?.id]);

  async function sair() {
    Alert.alert('Sair?', '', [
      { text:'Cancelar', style:'cancel' },
      { text:'Sair', style:'destructive', onPress:onLogout },
    ]);
  }

  if (tela==='carteira')  return <Carteira onBack={() => setTela('main')} userId={user?.id} />;
  if (tela==='host')      return <HostCadastro user={user} onBack={() => setTela('main')} onOk={() => { setHostStatus('pending'); setTela('main'); }} />;
  if (tela==='live-host') return <HostLive host={hostData} user={user} onEnd={() => setTela('main')} />;
  if (tela==='admin')     return <AdminPanel user={user} onBack={() => setTela('main')} />;

  const MENU = [
    hostStatus==='active' && { k:'live-host', emoji:'🔴', l:'Iniciar Live', s:'Comecar transmissao', cor:C.red, hl:true },
    !hostStatus && { k:'host', icon:'videocam-outline', l:'Quero ser host', s:'Faca lives e ganhe 55%', cor:C.red },
    { k:'carteira', icon:'wallet-outline', l:'Carteira', s:fmt(profile?.coins_balance||0) + ' coins', cor:C.gold },
    isAdmin && { k:'admin', emoji:'🔐', l:'Painel Admin', s:'Exclusivo Brazalive', cor:C.gold, hl:true },
  ].filter(Boolean);

  return (
    <ScrollView style={{ flex:1, backgroundColor:C.bg }} contentContainerStyle={{ paddingBottom:32 }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ padding:20, paddingTop:54 }}>
        <View style={{ flexDirection:'row', alignItems:'center', marginBottom:22, paddingBottom:20, borderBottomWidth:1, borderBottomColor:C.border }}>
          <View style={{ width:66, height:66, borderRadius:33, backgroundColor:C.s2, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:C.gold }}>
            <Ionicons name="person" size={34} color={C.muted} />
          </View>
          <View style={{ flex:1, marginLeft:14 }}>
            <Text style={{ color:C.white, fontSize:17, fontWeight:'800' }}>{profile?.username||user?.email?.split('@')[0]||'Usuario'}</Text>
            <Text style={{ color:C.muted, fontSize:11, marginTop:3 }}>{user?.email}</Text>
          </View>
        </View>
        <Pressable onPress={() => setTela('carteira')} style={{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:14, padding:15, marginBottom:12, borderWidth:1, borderColor:C.border }}>
          <Moeda size={34} />
          <View style={{ flex:1, marginLeft:13 }}>
            <Text style={{ color:C.muted, fontSize:11 }}>Saldo de coins</Text>
            <Text style={{ color:C.white, fontSize:24, fontWeight:'900', marginTop:2 }}>{fmt(profile?.coins_balance||0)}</Text>
          </View>
          <Text style={{ color:C.green, fontSize:13, fontWeight:'700' }}>Comprar</Text>
        </Pressable>
        {hostStatus==='pending' && (
          <View style={{ backgroundColor:'rgba(255,180,0,0.08)', borderRadius:12, padding:13, borderWidth:1, borderColor:'rgba(255,180,0,0.3)', marginBottom:12 }}>
            <Text style={{ color:C.gold, fontSize:12, fontWeight:'700', textAlign:'center' }}>Candidatura em analise - ate 48h</Text>
          </View>
        )}
        {MENU.map(m => (
          <Pressable key={m.k} onPress={() => setTela(m.k)} style={[{ flexDirection:'row', alignItems:'center', backgroundColor:C.s1, borderRadius:14, padding:15, marginBottom:10, borderWidth:1 }, m.hl?{ borderColor:m.cor+'55', backgroundColor:m.cor+'08' }:{ borderColor:C.border }]}>
            <View style={{ width:40, height:40, borderRadius:11, backgroundColor:C.s2, alignItems:'center', justifyContent:'center', marginRight:13 }}>
              {m.emoji ? <Text style={{ fontSize:19 }}>{m.emoji}</Text> : <Ionicons name={m.icon} size={19} color={m.cor} />}
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:m.hl?m.cor:C.white, fontSize:14, fontWeight:'700' }}>{m.l}</Text>
              <Text style={{ color:C.muted, fontSize:11, marginTop:2 }}>{m.s}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={m.hl?m.cor:C.muted} />
          </Pressable>
        ))}
        <Pressable onPress={sair} style={{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,46,63,0.07)', borderRadius:14, padding:15, marginTop:4, borderWidth:1, borderColor:'rgba(255,46,63,0.22)', gap:13 }}>
          <Ionicons name="log-out-outline" size={20} color={C.red} />
          <Text style={{ flex:1, color:C.red, fontSize:14, fontWeight:'700' }}>Sair da conta</Text>
        </Pressable>
        <Text style={{ color:C.muted, fontSize:10, textAlign:'center', marginTop:22 }}>Brazalive v18.0 beta - Feito com amor no Brasil</Text>
      </View>
    </ScrollView>
  );
}

// ── NAVEGAÇÃO ─────────────────────────────────────────────────
const TABS = [
  { k:'live',  l:'Live',   icon:'flame',         off:'flame-outline'         },
  { k:'chat',  l:'Chat',   icon:'chatbubble',    off:'chatbubble-outline'    },
  { k:'mim',   l:'Mim',    icon:'person-circle', off:'person-circle-outline' },
];

function BottomNav({ aba, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor:C.s1, borderTopWidth:1, borderTopColor:C.border, paddingTop:8, paddingBottom:Math.max(insets.bottom,10) }}>
      <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
        {TABS.map(t => {
          const on = aba === t.k;
          return (
            <Pressable key={t.k} onPress={() => onChange(t.k)} style={{ alignItems:'center', paddingHorizontal:10, paddingVertical:3, minWidth:55 }} hitSlop={5}>
              <Ionicons name={on?t.icon:t.off} size={24} color={on?C.red:C.muted} />
              <Text style={{ color:on?C.red:C.muted, fontSize:10, fontWeight:'600', marginTop:3 }}>{t.l}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainApp({ session }) {
  const [aba, setAba] = useState('live');
  const [liveHost, setLiveHost] = useState(null);
  const [convAtiva, setConvAtiva] = useState(null);
  const user = session.user;

  async function logout() { await db.auth.signOut(); }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ flex:1 }}>
        {aba==='live'  && !liveHost && <LiveFeed userId={user.id} onVerLive={setLiveHost} />}
        {aba==='live'  && liveHost  && <LivePlayer host={liveHost} userId={user.id} onBack={() => setLiveHost(null)} />}
        {aba==='chat'  && !convAtiva && <ChatLista userId={user.id} onAbrirConv={setConvAtiva} />}
        {aba==='chat'  && convAtiva  && <Conversa conv={convAtiva} userId={user.id} onBack={() => setConvAtiva(null)} />}
        {aba==='mim'   && <Mim user={user} onLogout={logout} />}
      </View>
      <BottomNav aba={aba} onChange={t => { setAba(t); setLiveHost(null); setConvAtiva(null); }} />
    </SafeAreaView>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splash, setSplash] = useState(true);
  const [tela, setTela] = useState('entrada');

  useEffect(() => {
    db.auth.getSession().then(({ data:{ session } }) => { setSession(session); setLoading(false); });
    const { data:{ subscription } } = db.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (splash) return <Splash onFim={() => setSplash(false)} />;
  if (loading) return <View style={{ flex:1, backgroundColor:C.bg, alignItems:'center', justifyContent:'center' }}><ActivityIndicator size="large" color={C.red} /></View>;
  if (session)  return <MainApp session={session} />;

  if (tela==='login')    return <Login onBack={() => setTela('entrada')} onCadastro={() => setTela('cadastro')} />;
  if (tela==='cadastro') return <Cadastro onBack={() => setTela('login')} />;
  return <Entrada onLogin={() => setTela('login')} onCadastro={() => setTela('cadastro')} />;
}

export default function App() {
  return <SafeAreaProvider><Root /></SafeAreaProvider>;
}
