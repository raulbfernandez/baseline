import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp, ChevronDown, Calendar, MapPin, X, Check,
  TrendingUp, Users, Swords, Activity, Target, Flame, Trophy, Plus, Minus, Search, Mail, Phone, User, Lock, Eye, EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

/* ============================================================
   THEME — clay court / vintage tennis club badge
   ============================================================ */
const C = {
  // Court surfaces
  clay: '#C4522A',          // terracotta clay court
  clayMid: '#A8421E',       // deeper clay
  clayDeep: '#7A2E12',      // dark clay shadow
  clayLight: '#D97B50',     // highlight clay

  // Parchment / paper
  parchment: '#F0E8D0',     // aged paper
  parchmentWarm: '#E8DCC0', // warmer parchment
  parchmentDeep: '#D4C49A', // border/ruled lines

  // Court lines / net
  courtWhite: '#F5F0E8',    // white court lines (warm)
  net: '#2A1F14',           // dark net/ink

  // Forest green (from badge)
  green: '#2B4A2E',         // laurel wreath green
  greenMid: '#3D6642',      // mid green
  greenLight: '#6B9B70',    // light green

  // Typography
  ink: '#1C130A',           // near-black, warm
  inkSoft: '#3D2E1E',       // dark brown
  inkMute: '#7A6548',       // muted tan-brown

  // Ball yellow
  optic: '#E8C93A',         // tennis ball yellow
  opticDeep: '#C4A020',     // deeper yellow

  // Semantic
  win: '#2B4A2E',
  loss: '#A8421E',
  line: '#C8B48A',          // ruled line
};


const SUPABASE_URL = 'https://oyqryjmlwdhcvvktkfub.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VQQ3MVMlFaGjYbNqxIJ-Og_JVZNOtSK';
const RESEND_KEY = '';

const sendEmail = async ({ to, subject, html }) => {
  if (!to) return;
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) {
    console.error('Email send error:', e);
  }
};
const DEFAULT_PASSWORD = 'tennis123';

const sb = {
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    return {
      async select(query = '*') {
        const r = await fetch(`${base}?select=${query}`, { headers });
        return r.json();
      },
      async insert(data) {
        const r = await fetch(base, { method: 'POST', headers, body: JSON.stringify(data) });
        return r.json();
      },
      async upsert(data) {
        const h = { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' };
        const r = await fetch(base, { method: 'POST', headers: h, body: JSON.stringify(data) });
        return r.json();
      },
      async update(data, match) {
        const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
        const r = await fetch(`${base}?${params}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
        return r.json();
      },
      async delete(match) {
        const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
        const r = await fetch(`${base}?${params}`, { method: 'DELETE', headers });
        return r.ok;
      },
      async selectWhere(field, value, query = '*') {
        const r = await fetch(`${base}?select=${query}&${field}=eq.${encodeURIComponent(value)}`, { headers });
        return r.json();
      },
    };
  }
};

const SESSION_KEY = 'baseline-session-v1';
const ADMINS = ['raulbfernandez@gmail.com'];

/* ============================================================
   SEED DATA — Los Feliz Tennis Club
   ============================================================ */
const seedPlayers = () => ([
  { id: 'p1',   name: 'Dan Addelson',        email: 'Daddelson@gmail.com',              phone: '',                  gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p2',   name: 'Stephan Andrews',     email: 'stephan.m.andrews@gmail.com',      phone: '(412) 330-7125',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p3',   name: 'Jacob Antolini',      email: 'jantolini80@gmail.com',            phone: '(323) 636-5361',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p4',   name: 'Oscar Arroyo',        email: 'oscararroyo217@gmail.com',         phone: '(559) 920-6081',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p5',   name: 'Gates Bradley',       email: 'not.gates@gmail.com',              phone: '512-206-6140',      gender: 'Male', points: 8, wins: 1, losses: 3, streak: 1 },
  { id: 'p6',   name: 'Chris Campbell-Orrock', email: 'chriscampbellorrock@gmail.com', phone: '(617) 823-9747',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p7',   name: 'Davin Cho',           email: 'dcho1733@gmail.com',               phone: '847-651-8664',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p8',   name: 'Amir Cohen',          email: 'amir@amircohen.com',               phone: '818-645-5250',      gender: 'Male', points: 27, wins: 6, losses: 2, streak: -1 },
  { id: 'p9',   name: 'Molly Cranna',        email: 'Molly.cranna@gmail.com',           phone: '617-230-4698',      gender: 'Female', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p10',  name: 'Sean Cunningham',     email: 'seandirectsthings@gmail.com',      phone: '315-430-9644',      gender: 'Male', points: 2, wins: 0, losses: 1, streak: -1 },
  { id: 'p11',  name: 'Artin Davodian',      email: 'artin300@yahoo.com',               phone: '818-653-1299',      gender: 'Male', points: 26, wins: 6, losses: 2, streak: 4 },
  { id: 'p12',  name: 'Mitch Eakins',        email: 'mitcheakins@gmail.com',            phone: '910-612-9109',      gender: 'Male', points: 17, wins: 3, losses: 5, streak: 1 },
  { id: 'p13',  name: 'Will Emery',          email: 'Willemeryfilm@gmail.com',          phone: '(707) 321-1571',    gender: 'Male', points: 17, wins: 4, losses: 1, streak: 1 },
  { id: 'p14',  name: 'Ally Fekaiki',        email: 'a.fekaiki@gmail.com',              phone: '(213) 679-4128',    gender: 'Male', points: 6, wins: 0, losses: 6, streak: -6 },
  { id: 'p15',  name: 'Michael Fernandez',   email: 'Mikevfernandez@gmail.com',         phone: '(310) 699-9823',    gender: 'Male', points: 7, wins: 1, losses: 3, streak: -3 },
  { id: 'p16',  name: 'Ruben Fernandez',     email: 'rubenruss@me.com',                 phone: '(323) 547-3008',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p17',  name: 'Raul Fernandez',      email: 'raulbfernandez@gmail.com',         phone: '954-257-9002',      gender: 'Male', points: 5, wins: 1, losses: 1, streak: 1 },
  { id: 'p18',  name: 'Zach Fishbain',       email: 'zfishbain@gmail.com',              phone: '262-994-7545',      gender: 'Male', points: 16, wins: 4, losses: 1, streak: 2 },
  { id: 'p19',  name: 'Brad Gilboe',         email: 'bradgilboe@gmail.com',             phone: '818-632-2296',      gender: 'Male', points: 33, wins: 7, losses: 8, streak: -1 },
  { id: 'p20',  name: 'Miguel Hadelich',     email: 'miguel.hadelich@gmail.com',        phone: '818-625-2873',      gender: 'Male', points: 5, wins: 1, losses: 1, streak: 1 },
  { id: 'p21',  name: 'Yoram Heller',        email: 'yoram.heller@gmail.com',           phone: '(646) 372-0003',    gender: 'Male', points: 10, wins: 2, losses: 2, streak: 2 },
  { id: 'p22',  name: 'Andre Herrero',       email: 'andreherrero@gmail.com',           phone: '(360) 739-9549',    gender: 'Male', points: 3, wins: 0, losses: 2, streak: -2 },
  { id: 'p23',  name: 'Peter Hyan',          email: 'peterhyan@hotmail.com',            phone: '213-718-6607',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p24',  name: 'Jeff Israel',         email: 'jtisrael@gmail.com',               phone: '(917) 586-3942',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p25',  name: 'James Joslin',        email: 'james.brewster.joslin@gmail.com',  phone: '(419) 340-7296',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p26',  name: 'Ezekiel Joubert',     email: 'ejoubertiii@gmail.com',            phone: '734-716-2625',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p27',  name: 'Elijah Kim',          email: 'elijahkim@gmail.com',              phone: '310-425-9390',      gender: 'Male', points: 30, wins: 7, losses: 4, streak: 2 },
  { id: 'p28',  name: 'Spencer Kimes',       email: 'Spencer.kimes@gmail.com',          phone: '916-622-9580',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p29',  name: 'Seth Klugman',        email: 'sethklugman@gmail.com',            phone: '(310) 854-2318',    gender: 'Male', points: 11, wins: 2, losses: 4, streak: 1 },
  { id: 'p30',  name: 'Ashok Krishna',       email: 'krishna.ashok@gmail.com',          phone: '',                  gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p31',  name: 'Alex Lehmann',        email: 'mralexlehmann@gmail.com',          phone: '(310) 922-5737',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p32',  name: 'Ray Li',              email: 'Raymondxli@gmail.com',             phone: '(646) 241-8003',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p33',  name: 'Gabe Manabat',        email: 'esgmanabat@gmail.com',             phone: '323-633-1169',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p34',  name: 'Kelly McMillen',      email: 'kjmcmillen@yahoo.com',             phone: '310-592-1541',      gender: 'Male', points: 13, wins: 3, losses: 1, streak: 3 },
  { id: 'p35',  name: 'Pete Meyers',         email: 'meyerspa@gmail.com',               phone: '818-426-8881',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p36',  name: 'Nelson Miranda',      email: 'nelsonmenell@gmail.com',           phone: '(202) 812-4218',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p37',  name: 'Krish Nathan',        email: 'Krishnathan@me.com',               phone: '(818) 554-8274',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p38',  name: 'Tony Ngo',            email: 'tony.ngo@gmail.com',               phone: '714-307-1729',      gender: 'Male', points: 24, wins: 4, losses: 6, streak: -3 },
  { id: 'p39',  name: 'Steve Pillemer',      email: 'Stevepillemer@gmail.com',          phone: '(424) 335-1657',    gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p40',  name: 'Alex Plapinger',      email: 'asplapinger@gmail.com',            phone: '(310) 430-8430',    gender: 'Male', points: 11, wins: 3, losses: 0, streak: 3 },
  { id: 'p41',  name: 'Eric Priestley',      email: 'erictpriestley@gmail.com',         phone: '949-466-5817',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p42',  name: 'Mark Raia',           email: 'mraia12@gmail.com',                phone: '213-210-8245',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p43',  name: 'Chris Rose',          email: 'hellochrisrose@gmail.com',         phone: '512-289-7118',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p44',  name: 'Jerry Santana',       email: 'gerardsantana1@gmail.com',         phone: '323-307-6858',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p45',  name: 'Steve Sekkas',        email: 'Stevemsekkas@gmail.com',           phone: '(310) 704-6700',    gender: 'Male', points: 13, wins: 2, losses: 3, streak: -1 },
  { id: 'p46',  name: 'Edward Shin',         email: 'edwardshinn@gmail.com',            phone: '213-435-0378',      gender: 'Male', points: 21, wins: 4, losses: 4, streak: -2 },
  { id: 'p47',  name: 'Tyler Simmons',       email: 'tytysimmons@gmail.com',            phone: '949-290-2370',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p48',  name: 'Paul Stanczak',       email: 'paulstanczak@gmail.com',           phone: '323-877-6002',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p49',  name: 'Alex Stock',          email: 'alexgstock@gmail.com',             phone: '925-330-1916',      gender: 'Male', points: 22, wins: 4, losses: 6, streak: 1 },
  { id: 'p50',  name: 'Zach Sutton',         email: 'zsuttmusic@gmail.com',             phone: '323-304-0351',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p51',  name: 'Mark Tewarson',       email: 'tewar1@yahoo.com',                 phone: '917-554-6569',      gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p52',  name: 'Benny Tran',          email: 'bennybtran@gmail.com',             phone: '310-985-5623',      gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p53',  name: 'Alex Utay',           email: 'autay622@gmail.com',               phone: '917-499-4999',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p54',  name: 'Peyton Wallace',      email: 'Peytonwallace@gmail.com',          phone: '310-614-6519',      gender: 'Male', points: 12, wins: 3, losses: 0, streak: 3 },
  { id: 'p55',  name: 'Frank Walsh',         email: 'frank@manuka.la',                  phone: '310-880-2223',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
  { id: 'p56',  name: 'Mark Whalen',         email: 'Mark@markwhalenstudio.com',        phone: '(213) 595-4973',    gender: 'Male', points: 1, wins: 0, losses: 1, streak: -1 },
  { id: 'p57',  name: 'Tony Wise',           email: 'anthonymwise@gmail.com',           phone: '213-503-0142',      gender: 'Male', points: 13, wins: 3, losses: 2, streak: -1 },
  { id: 'p58',  name: 'Brad Zeff',           email: 'bradzeff@gmail.com',               phone: '310-907-6515',      gender: 'Male', points: 0, wins: 0, losses: 0, streak: 0 },
]);

const seedMatches = () => ([
  {id:'m1',a:'p18',b:'p38',status:'completed',winnerId:'p18',score:'6-3,4-6, (13-11)',sets:[{a:6,b:3},{a:4,b:6},{a:13,b:11,isTiebreak:true}],date:'2026-04-24',change:3},
  {id:'m2',a:'p8',b:'p29',status:'completed',winnerId:'p8',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2026-04-23',change:4},
  {id:'m3',a:'p18',b:'p49',status:'completed',winnerId:'p18',score:'6-3,4-6, (10-5)',sets:[{a:6,b:3},{a:4,b:6},{a:10,b:5,isTiebreak:true}],date:'2026-04-18',change:3},
  {id:'m4',a:'p27',b:'p18',status:'completed',winnerId:'p27',score:'6-4,1-6, (10-7)',sets:[{a:6,b:4},{a:1,b:6},{a:10,b:7,isTiebreak:true}],date:'2026-04-14',change:3},
  {id:'m5',a:'p8',b:'p49',status:'completed',winnerId:'p8',score:'6-3,7-6 (7-5)',sets:[{a:6,b:3},{a:7,b:6}],date:'2026-04-11',change:4},
  {id:'m6',a:'p18',b:'p45',status:'completed',winnerId:'p18',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-04-11',change:4},
  {id:'m7',a:'p18',b:'p19',status:'completed',winnerId:'p18',score:'7-5,6-4',sets:[{a:7,b:5},{a:6,b:4}],date:'2026-04-04',change:4},
  {id:'m8',a:'p11',b:'p19',status:'completed',winnerId:'p11',score:'6-2,7-6 (7-2)',sets:[{a:6,b:2},{a:7,b:6}],date:'2026-04-04',change:4},
  {id:'m9',a:'p11',b:'p46',status:'completed',winnerId:'p11',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-03-30',change:4},
  {id:'m10',a:'p13',b:'p34',status:'completed',winnerId:'p13',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-03-26',change:4},
  {id:'m11',a:'p46',b:'p8',status:'completed',winnerId:'p46',score:'6-7 (5-7),6-3, (10-2)',sets:[{a:6,b:7},{a:6,b:3},{a:10,b:2,isTiebreak:true}],date:'2026-03-23',change:3},
  {id:'m12',a:'p34',b:'p19',status:'completed',winnerId:'p34',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2026-03-22',change:4},
  {id:'m13',a:'p13',b:'p19',status:'completed',winnerId:'p13',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-03-21',change:4},
  {id:'m14',a:'p8',b:'p51',status:'completed',winnerId:'p8',score:'6-2,6-0',sets:[{a:6,b:2},{a:6,b:0}],date:'2026-03-21',change:4},
  {id:'m15',a:'p38',b:'p12',status:'completed',winnerId:'p38',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-03-16',change:4},
  {id:'m16',a:'p15',b:'p14',status:'completed',winnerId:'p15',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-03-11',change:4},
  {id:'m17',a:'p57',b:'p12',status:'completed',winnerId:'p57',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-03-09',change:4},
  {id:'m18',a:'p13',b:'p29',status:'completed',winnerId:'p13',score:'6-0,6-0',sets:[{a:6,b:0},{a:6,b:0}],date:'2026-03-09',change:4},
  {id:'m19',a:'p54',b:'p57',status:'completed',winnerId:'p54',score:'6-4,6-1',sets:[{a:6,b:4},{a:6,b:1}],date:'2026-03-05',change:4},
  {id:'m20',a:'p38',b:'p27',status:'completed',winnerId:'p38',score:'4-6,6-1, (10-7)',sets:[{a:4,b:6},{a:6,b:1},{a:10,b:7,isTiebreak:true}],date:'2026-03-04',change:3},
  {id:'m21',a:'p49',b:'p14',status:'completed',winnerId:'p49',score:'6-1,6-0',sets:[{a:6,b:1},{a:6,b:0}],date:'2026-03-04',change:4},
  {id:'m22',a:'p12',b:'p14',status:'completed',winnerId:'p12',score:'6-2,6-0',sets:[{a:6,b:2},{a:6,b:0}],date:'2026-03-03',change:4},
  {id:'m23',a:'p46',b:'p15',status:'completed',winnerId:'p46',score:'6-2,6-1',sets:[{a:6,b:2},{a:6,b:1}],date:'2026-03-02',change:4},
  {id:'m24',a:'p46',b:'p20',status:'completed',winnerId:'p46',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-03-01',change:4},
  {id:'m25',a:'p54',b:'p46',status:'completed',winnerId:'p54',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-02-27',change:4},
  {id:'m26',a:'p19',b:'p38',status:'completed',winnerId:'p19',score:'5-7,6-0, (10-6)',sets:[{a:5,b:7},{a:6,b:0},{a:10,b:6,isTiebreak:true}],date:'2026-02-26',change:3},
  {id:'m27',a:'p27',b:'p17',status:'completed',winnerId:'p27',score:'6-0,3-6, (10-7)',sets:[{a:6,b:0},{a:3,b:6},{a:10,b:7,isTiebreak:true}],date:'2026-02-26',change:3},
  {id:'m28',a:'p49',b:'p38',status:'completed',winnerId:'p49',score:'3-6,6-3, (10-4)',sets:[{a:3,b:6},{a:6,b:3},{a:10,b:4,isTiebreak:true}],date:'2026-02-25',change:3},
  {id:'m29',a:'p46',b:'p22',status:'completed',winnerId:'p46',score:'6-3,6-0',sets:[{a:6,b:3},{a:6,b:0}],date:'2026-02-22',change:4},
  {id:'m30',a:'p57',b:'p49',status:'completed',winnerId:'p57',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-02-21',change:4},
  {id:'m31',a:'p27',b:'p46',status:'completed',winnerId:'p27',score:'2-6,6-4, (10-8)',sets:[{a:2,b:6},{a:6,b:4},{a:10,b:8,isTiebreak:true}],date:'2026-02-19',change:3},
  {id:'m32',a:'p29',b:'p22',status:'completed',winnerId:'p29',score:'6-2,6-7 (5-7),7-6 (10-8)',sets:[{a:6,b:2},{a:6,b:7},{a:7,b:6}],date:'2026-02-14',change:3},
  {id:'m33',a:'p40',b:'p46',status:'completed',winnerId:'p40',score:'6-0,1-6,7-6 (10-8)',sets:[{a:6,b:0},{a:1,b:6},{a:7,b:6}],date:'2026-02-14',change:3},
  {id:'m34',a:'p19',b:'p45',status:'completed',winnerId:'p19',score:'3-6,6-3, (10-8)',sets:[{a:3,b:6},{a:6,b:3},{a:10,b:8,isTiebreak:true}],date:'2026-02-13',change:3},
  {id:'m35',a:'p34',b:'p13',status:'completed',winnerId:'p34',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-02-13',change:4},
  {id:'m36',a:'p34',b:'p11',status:'completed',winnerId:'p34',score:'6-4,7-6 (7-5)',sets:[{a:6,b:4},{a:7,b:6}],date:'2026-02-10',change:4},
  {id:'m37',a:'p40',b:'p15',status:'completed',winnerId:'p40',score:'6-4,6-1',sets:[{a:6,b:4},{a:6,b:1}],date:'2026-02-07',change:4},
  {id:'m38',a:'p13',b:'p19',status:'completed',winnerId:'p13',score:'7-5,7-6 (8-6)',sets:[{a:7,b:5},{a:7,b:6}],date:'2026-02-07',change:4},
  {id:'m39',a:'p49',b:'p5',status:'completed',winnerId:'p49',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-02-07',change:4},
  {id:'m40',a:'p45',b:'p27',status:'completed',winnerId:'p45',score:'6-0,6-4',sets:[{a:6,b:0},{a:6,b:4}],date:'2026-02-06',change:4},
  {id:'m41',a:'p27',b:'p11',status:'completed',winnerId:'p27',score:'2-6,7-6 (7-2),7-6 (10-7)',sets:[{a:2,b:6},{a:7,b:6},{a:7,b:6}],date:'2026-02-06',change:3},
  {id:'m42',a:'p11',b:'p19',status:'completed',winnerId:'p11',score:'7-5,6-3',sets:[{a:7,b:5},{a:6,b:3}],date:'2026-02-06',change:4},
  {id:'m43',a:'p45',b:'p12',status:'completed',winnerId:'p45',score:'6-1,6-4',sets:[{a:6,b:1},{a:6,b:4}],date:'2026-02-05',change:4},
  {id:'m44',a:'p19',b:'p5',status:'completed',winnerId:'p19',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-02-05',change:4},
  {id:'m45',a:'p17',b:'p12',status:'completed',winnerId:'p17',score:'3-6,6-4,7-6 (10-8)',sets:[{a:3,b:6},{a:6,b:4},{a:7,b:6}],date:'2026-02-03',change:3},
  {id:'m46',a:'p40',b:'p29',status:'completed',winnerId:'p40',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-01-31',change:4},
  {id:'m47',a:'p20',b:'p14',status:'completed',winnerId:'p20',score:'6-2,6-3',sets:[{a:6,b:2},{a:6,b:3}],date:'2026-01-30',change:4},
  {id:'m48',a:'p12',b:'p5',status:'completed',winnerId:'p12',score:'2-6,6-4,7-5',sets:[{a:2,b:6},{a:6,b:4},{a:7,b:5}],date:'2026-01-29',change:3},
  {id:'m49',a:'p57',b:'p27',status:'completed',winnerId:'p57',score:'6-0,2-6,7-6 (10-3)',sets:[{a:6,b:0},{a:2,b:6},{a:7,b:6}],date:'2026-01-29',change:3},
  {id:'m50',a:'p11',b:'p45',status:'completed',winnerId:'p11',score:'6-1,3-6,7-6 (10-7)',sets:[{a:6,b:1},{a:3,b:6},{a:7,b:6}],date:'2026-01-28',change:3},
  {id:'m51',a:'p11',b:'p21',status:'completed',winnerId:'p11',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-01-26',change:4},
  {id:'m52',a:'p54',b:'p21',status:'completed',winnerId:'p54',score:'7-5,6-4',sets:[{a:7,b:5},{a:6,b:4}],date:'2026-01-26',change:4},
  {id:'m53',a:'p19',b:'p10',status:'completed',winnerId:'p19',score:'7-6 (7-5),3-6,7-6 (10-6)',sets:[{a:7,b:6},{a:3,b:6},{a:7,b:6}],date:'2026-01-24',change:3},
  {id:'m54',a:'p38',b:'p15',status:'completed',winnerId:'p38',score:'6-1,6-2',sets:[{a:6,b:1},{a:6,b:2}],date:'2026-01-23',change:4},
  {id:'m55',a:'p8',b:'p14',status:'completed',winnerId:'p8',score:'6-0,6-0',sets:[{a:6,b:0},{a:6,b:0}],date:'2026-01-23',change:4},
  {id:'m56',a:'p38',b:'p52',status:'completed',winnerId:'p38',score:'6-3,6-0',sets:[{a:6,b:3},{a:6,b:0}],date:'2026-01-22',change:4},
  {id:'m57',a:'p5',b:'p14',status:'completed',winnerId:'p5',score:'6-1,6-0',sets:[{a:6,b:1},{a:6,b:0}],date:'2026-01-20',change:4},
  {id:'m58',a:'p21',b:'p12',status:'completed',winnerId:'p21',score:'6-0,6-3',sets:[{a:6,b:0},{a:6,b:3}],date:'2026-01-20',change:4},
  {id:'m59',a:'p8',b:'p49',status:'completed',winnerId:'p8',score:'6-4,7-6 (7-4)',sets:[{a:6,b:4},{a:7,b:6}],date:'2026-01-17',change:4},
  {id:'m60',a:'p19',b:'p57',status:'completed',winnerId:'p19',score:'7-6 (10-8),6-3',sets:[{a:7,b:6},{a:6,b:3}],date:'2026-01-17',change:4},
  {id:'m61',a:'p27',b:'p38',status:'completed',winnerId:'p27',score:'7-6 (7-4),6-4',sets:[{a:7,b:6},{a:6,b:4}],date:'2026-01-15',change:4},
  {id:'m62',a:'p12',b:'p49',status:'completed',winnerId:'p12',score:'6-4,6-4',sets:[{a:6,b:4},{a:6,b:4}],date:'2026-01-14',change:4},
  {id:'m63',a:'p8',b:'p29',status:'completed',winnerId:'p8',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2026-01-10',change:4},
  {id:'m64',a:'p21',b:'p19',status:'completed',winnerId:'p21',score:'6-4,7-5',sets:[{a:6,b:4},{a:7,b:5}],date:'2026-01-10',change:4},
  {id:'m65',a:'p19',b:'p27',status:'completed',winnerId:'p19',score:'6-3,6-4',sets:[{a:6,b:3},{a:6,b:4}],date:'2026-01-09',change:4},
  {id:'m66',a:'p11',b:'p49',status:'completed',winnerId:'p11',score:'6-3,6-2',sets:[{a:6,b:3},{a:6,b:2}],date:'2025-12-29',change:4},
  {id:'m67',a:'p29',b:'p56',status:'completed',winnerId:'p29',score:'6-1,7-6 (7-5)',sets:[{a:6,b:1},{a:7,b:6}],date:'2025-12-20',change:4},
  {id:'m68',a:'p19',b:'p38',status:'completed',winnerId:'p19',score:'6-0,7-5',sets:[{a:6,b:0},{a:7,b:5}],date:'2025-12-20',change:4},
  {id:'m69',a:'p49',b:'p38',status:'completed',winnerId:'p49',score:'6-2,6-1',sets:[{a:6,b:2},{a:6,b:1}],date:'2025-12-18',change:4},
  {id:'m70',a:'p27',b:'p8',status:'completed',winnerId:'p27',score:'6-4,7-6 (7-4)',sets:[{a:6,b:4},{a:7,b:6}],date:'2025-12-13',change:4},
  {id:'m71',a:'p27',b:'p19',status:'completed',winnerId:'p27',score:'6-4,6-0',sets:[{a:6,b:4},{a:6,b:0}],date:'2025-12-11',change:4},
]);

const VENUES = ['Vermont Canyon', 'Griffith Park / Riverside', "Artin's of Glendale", 'Griffith Park Carousel', 'Other'];

/* ============================================================
   HELPERS
   ============================================================ */
/**
 * Calculate points earned by each player in a match.
 * Rules:
 *  - Everyone gets 1 point for playing
 *  - 1 point per set won
 *  - 1 bonus point for winning in straight sets (2 sets, no 3rd)
 *
 * sets: array of { a: number, b: number } (scores for player A and B)
 * winnerId: 'a' | 'b' (relative, not player id)
 * Returns { a: points, b: points }
 */
const calcPoints = (sets, winnerSide) => {
  const validSets = sets.filter(s => s !== null);
  let aPoints = 1; // participation
  let bPoints = 1;

  // Points per set won
  for (const s of validSets) {
    if (s.a > s.b) aPoints++;
    else bPoints++;
  }

  // Straight sets bonus (winner won in exactly 2 sets)
  if (validSets.length === 2) {
    if (winnerSide === 'a') aPoints += 1;
    else bPoints += 1;
  }

  return { a: aPoints, b: bPoints };
};

const rank = (players) => [...players].sort((a, b) => {
  if (b.points !== a.points) return b.points - a.points;
  return (b.wins + b.losses) - (a.wins + a.losses); // tiebreaker: more matches played ranks higher
});
const find = (players, id) => players.find(p => p.id === id);
const rankOf = (players, id) => rank(players).findIndex(p => p.id === id) + 1;

const initials = (name) => name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtDateTime = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/* Derive all stats for a player from the completed match list */
const calcStats = (playerId, matches, players) => {
  const completed = matches.filter(m => m.status === 'completed' && (m.a === playerId || m.b === playerId));

  let matchWins = 0, matchLosses = 0;
  let setsWon = 0, setsLost = 0;
  let gamesWon = 0, gamesLost = 0;
  const h2h = {}; // opponentId -> { wins, losses }

  for (const m of completed) {
    const side = m.a === playerId ? 'a' : 'b';
    const oppSide = side === 'a' ? 'b' : 'a';
    const oppId = m[oppSide];
    const won = m.winnerId === playerId;

    won ? matchWins++ : matchLosses++;

    if (!h2h[oppId]) h2h[oppId] = { wins: 0, losses: 0 };
    won ? h2h[oppId].wins++ : h2h[oppId].losses++;

    if (m.sets && Array.isArray(m.sets)) {
      for (const s of m.sets) {
        if (!s) continue;
        const myGames = s[side] ?? 0;
        const oppGames = s[oppSide] ?? 0;
        gamesWon += myGames;
        gamesLost += oppGames;
        if (myGames > oppGames) setsWon++;
        else if (oppGames > myGames) setsLost++;
      }
    }
  }

  const winRate = matchWins + matchLosses > 0
    ? Math.round((matchWins / (matchWins + matchLosses)) * 100) : 0;

  const h2hList = Object.entries(h2h).map(([id, record]) => ({
    player: find(players, id),
    ...record,
  })).filter(e => e.player).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

  return { matchWins, matchLosses, setsWon, setsLost, gamesWon, gamesLost, winRate, h2hList, played: completed.length };
};

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ players, passwords, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const normalized = email.trim().toLowerCase();
    const player = players.find(p => p.email.toLowerCase() === normalized);
    if (!player) { setError('No account found with that email.'); return; }
    const stored = passwords[player.id] || DEFAULT_PASSWORD;
    if (password !== stored) { setError('Incorrect password.'); return; }
    setError('');
    onLogin(player.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ fontFamily: '"DM Sans", sans-serif', background: '#E8DCC8' }}>
      <PaperTexture />
      {/* Tennis court — horizontal net, singles */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {/* Singles court boundary */}
          <rect x="8%" y="5%" width="84%" height="90%" fill="none" stroke={C.clay} strokeWidth="2.5"/>
          {/* Net — horizontal center, extends beyond court */}
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke={C.clay} strokeWidth="3"/>
          {/* Service lines */}
          <line x1="8%" y1="28%" x2="92%" y2="28%" stroke={C.clay} strokeWidth="1.5"/>
          <line x1="8%" y1="72%" x2="92%" y2="72%" stroke={C.clay} strokeWidth="1.5"/>
          {/* Center service line */}
          <line x1="50%" y1="28%" x2="50%" y2="72%" stroke={C.clay} strokeWidth="1.5"/>
        </svg>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BaselineLogo size={52} />
        </div>

        <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, color: C.ink, marginBottom: 4 }}>
            Sign in
          </div>
          <div className="text-[12px] mb-5" style={{ color: C.inkMute }}>
            Use your club email and password
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold block mb-1.5" style={{ color: C.inkMute }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${error ? C.clay : C.line}`, borderRadius: 8, fontSize: 16, fontFamily: 'inherit', background: C.parchmentWarm, color: C.ink, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold block mb-1.5" style={{ color: C.inkMute }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 40px 12px 14px', border: `1.5px solid ${error ? C.clay : C.line}`, borderRadius: 8, fontSize: 16, fontFamily: 'inherit', background: C.parchmentWarm, color: C.ink, boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: 4 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-[12px] mb-3 px-3 py-2 rounded" style={{ background: `${C.clay}18`, color: C.clay }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-[0.1em]"
            style={{ background: C.clay, color: 'white' }}
          >
            Sign In
          </button>

          <div className="text-[11px] text-center mt-4" style={{ color: C.inkMute }}>
            Default password: <span style={{ fontFamily: '"JetBrains Mono", monospace', color: C.ink }}>tennis123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('ladder');
  const [players, setPlayers] = useState(seedPlayers);
  const [matches, setMatches] = useState(seedMatches);
  const [passwords, setPasswords] = useState({});
  const [deletedMatchIds, setDeletedMatchIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  /* Inject editorial fonts */
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  /* Load from Supabase on mount */
  useEffect(() => {
    (async () => {
      try {
        // Restore session
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const { userId } = JSON.parse(savedSession);
          if (userId) { setCurrentUserId(userId); setLoggedIn(true); }
        }

        // Load players from Supabase
        const db = await sb.from('players');
        const dbPlayers = await db.select();
        if (Array.isArray(dbPlayers) && dbPlayers.length > 0) {
          // Map Supabase snake_case to camelCase
          setPlayers(dbPlayers.map(p => ({
            id: p.id, name: p.name, email: p.email, phone: p.phone,
            gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
            streak: p.streak, ustaRating: p.usta_rating, profileImage: p.profile_image,
            isActive: p.is_active,
          })));
        } else {
          // First run — seed players into Supabase
          const seeds = seedPlayers();
          const db2 = await sb.from('players');
          await db2.upsert(seeds.map(p => ({
            id: p.id, name: p.name, email: p.email, phone: p.phone,
            gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
            streak: p.streak, usta_rating: p.ustaRating || null,
            profile_image: p.profileImage || null, is_active: p.isActive !== false,
          })));
        }

        // Load matches from Supabase
        const mdb = await sb.from('matches');
        const dbMatches = await mdb.select();
        if (Array.isArray(dbMatches) && dbMatches.length > 0) {
          setMatches(dbMatches.map(m => ({
            id: m.id, a: m.player_a, b: m.player_b, status: m.status,
            winnerId: m.winner_id, score: m.score, sets: m.sets,
            proposedDate: m.proposed_date, location: m.location,
            winnerChange: m.winner_change, loserChange: m.loser_change,
            change: m.change_pts, date: m.match_date,
          })));
        } else {
          // Seed matches
          const seeds = seedMatches();
          const mdb2 = await sb.from('matches');
          await mdb2.upsert(seeds.map(m => ({
            id: m.id, player_a: m.a, player_b: m.b, status: m.status,
            winner_id: m.winnerId || null, score: m.score || null, sets: m.sets || null,
            proposed_date: m.proposedDate || null, location: m.location || null,
            winner_change: m.winnerChange || null, loser_change: m.loserChange || null,
            change_pts: m.change || null, match_date: m.date || null,
          })));
          setMatches(seeds);
        }

        // Load passwords
        const pdb = await sb.from('passwords');
        const dbPasswords = await pdb.select();
        if (Array.isArray(dbPasswords)) {
          const pwMap = {};
          dbPasswords.forEach(row => { pwMap[row.player_id] = row.password_hash; });
          setPasswords(pwMap);
        }
      } catch (e) { console.error('Load error:', e); }
      setLoaded(true);
    })();
  }, []);

  /* Sync player to Supabase */
  const syncPlayer = async (player) => {
    try {
      const db = await sb.from('players');
      await db.upsert({
        id: player.id, name: player.name, email: player.email, phone: player.phone,
        gender: player.gender, points: player.points, wins: player.wins, losses: player.losses,
        streak: player.streak, usta_rating: player.ustaRating || null,
        profile_image: player.profileImage || null, is_active: player.isActive !== false,
      });
    } catch (e) { console.error('Sync player error:', e); }
  };

  /* Sync match to Supabase */
  const syncMatch = async (match) => {
    try {
      const db = await sb.from('matches');
      await db.upsert({
        id: match.id, player_a: match.a, player_b: match.b, status: match.status,
        winner_id: match.winnerId || null, score: match.score || null, sets: match.sets || null,
        proposed_date: match.proposedDate || null, location: match.location || null,
        winner_change: match.winnerChange || null, loser_change: match.loserChange || null,
        change_pts: match.change || null, match_date: match.date || null,
      });
    } catch (e) { console.error('Sync match error:', e); }
  };

  /* Delete match from Supabase */
  const deleteMatchFromDB = async (matchId) => {
    try {
      const db = await sb.from('matches');
      await db.delete({ id: matchId });
    } catch (e) { console.error('Delete match error:', e); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
    setLoggedIn(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  };

  const handleSignOut = () => {
    setLoggedIn(false);
    setCurrentUserId(null);
    setTab('ladder');
    localStorage.removeItem(SESSION_KEY);
  };

  const reset = async () => {
    try {
      // Re-seed players
      const seeds = seedPlayers();
      const pdb = await sb.from('players');
      await pdb.upsert(seeds.map(p => ({
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        gender: p.gender, points: p.points, wins: p.wins, losses: p.losses,
        streak: p.streak, usta_rating: null, profile_image: null, is_active: true,
      })));
      // Re-seed matches
      const mseeds = seedMatches();
      const mdb = await sb.from('matches');
      await mdb.upsert(mseeds.map(m => ({
        id: m.id, player_a: m.a, player_b: m.b, status: m.status,
        winner_id: m.winnerId || null, score: m.score || null, sets: m.sets || null,
        proposed_date: null, location: m.location || null,
        winner_change: m.winnerChange || null, loser_change: m.loserChange || null,
        change_pts: m.change || null, match_date: m.date || null,
      })));
      // Clear passwords
      const pwdb = await sb.from('passwords');
      // Can't bulk delete easily — just reset state
      setPlayers(seeds);
      setMatches(mseeds);
      setPasswords({});
      setDeletedMatchIds(new Set());
      setLoggedIn(false);
      setCurrentUserId(null);
      localStorage.removeItem(SESSION_KEY);
      showToast('Reset to fresh ladder');
    } catch (e) {
      console.error('Reset error:', e);
      showToast('Reset failed');
    }
  };

  const changePassword = async (newPassword) => {
    const me = find(players, currentUserId);
    if (!me) return;
    setPasswords(prev => ({ ...prev, [me.id]: newPassword }));
    try {
      const db = await sb.from('passwords');
      await db.upsert({ player_id: me.id, password_hash: newPassword });
    } catch (e) { console.error('Password save error:', e); }
    showToast('Password updated');
  };

  const resetUserPassword = async (playerId) => {
    setPasswords(prev => { const u = { ...prev }; delete u[playerId]; return u; });
    try {
      const db = await sb.from('passwords');
      await db.delete({ player_id: playerId });
    } catch (e) { console.error('Password reset error:', e); }
    showToast('Password reset to default');
  };

  const canManagePasswords = () => {
    const me = find(players, currentUserId);
    return me && ADMINS.includes(me.email.toLowerCase());
  };

  const isAdmin = () => {
    const me = find(players, currentUserId);
    return me && ADMINS.includes(me.email.toLowerCase());
  };

  const togglePlayerActive = async (playerId) => {
    const player = find(players, playerId);
    const newActive = player?.isActive === false ? true : false;
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isActive: newActive } : p));
    try {
      const db = await sb.from('players');
      await db.update({ is_active: newActive }, { id: playerId });
    } catch (e) { console.error('Toggle active error:', e); }
    showToast(newActive ? `${player?.name} shown` : `${player?.name} hidden`);
  };

  const updateProfile = async (updates) => {
    setPlayers(prev => prev.map(p => p.id === currentUserId ? { ...p, ...updates } : p));
    try {
      const db = await sb.from('players');
      await db.update({
        usta_rating: updates.ustaRating || null,
        profile_image: updates.profileImage || null,
      }, { id: currentUserId });
    } catch (e) { console.error('Profile update error:', e); }
    showToast('Profile updated');
  };

  /* Challenge another player */
  const proposeChallenge = async ({ opponentId, date, location }) => {
    const newMatch = {
      id: 'm' + Date.now(),
      a: currentUserId, b: opponentId,
      status: 'scheduled',
      proposedDate: date,
      location,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setMatches(prev => [newMatch, ...prev]);
    await syncMatch(newMatch);

    // Email the opponent
    const challenger = find(players, currentUserId);
    const opponent = find(players, opponentId);
    if (opponent?.email) {
      await sendEmail({
        to: opponent.email,
        subject: `🎾 You've been challenged on Los Feliz Tennis Club!`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #C4522A;">You've been challenged!</h2>
            <p><strong>${challenger?.name || 'A player'}</strong> has challenged you to a match on <strong>Los Feliz Tennis Club</strong>.</p>
            <table style="margin: 16px 0; border-collapse: collapse;">
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📅 Date</td><td><strong>${date}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📍 Location</td><td><strong>${location}</strong></td></tr>
            </table>
            <p>Log in to <a href="https://baseline-alpha.vercel.app" style="color: #C4522A;">Baseline</a> to view your challenge.</p>
            <p style="color: #7A6548; font-size: 13px;">— The Los Feliz Tennis Club Team</p>
          </div>
        `,
      });
    }

    showToast(`Challenge sent to ${opponent?.name}`);
  };

  const acceptMatch = async (matchId) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'scheduled' } : m));
    try { const db = await sb.from('matches'); await db.update({ status: 'scheduled' }, { id: matchId }); } catch(e) {}
    showToast('Match accepted');
  };
  const declineMatch = async (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    await deleteMatchFromDB(matchId);
    showToast('Challenge declined');
  };
  const cancelMatch = async (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    await deleteMatchFromDB(matchId);
    showToast('Match cancelled');
  };

  const deleteMatch = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== 'completed') return;

    const winnerId = match.winnerId;
    const loserId = winnerId === match.a ? match.b : match.a;
    const winnerPts = match.winnerChange ?? match.change ?? 0;
    const loserPts = match.loserChange ?? (() => {
      if (!match.sets) return 1;
      const validSets = match.sets.filter(s => s);
      let pts = 1;
      const loserSide = winnerId === match.a ? 'b' : 'a';
      const winnerSide = loserSide === 'a' ? 'b' : 'a';
      for (const s of validSets) { if (s[loserSide] > s[winnerSide]) pts++; }
      return pts;
    })();

    const updatedPlayers = players.map(p => {
      if (p.id === winnerId) return { ...p, points: Math.max(0, p.points - winnerPts), wins: Math.max(0, p.wins - 1), streak: 0 };
      if (p.id === loserId)  return { ...p, points: Math.max(0, p.points - loserPts),  losses: Math.max(0, p.losses - 1), streak: 0 };
      return p;
    });
    setPlayers(updatedPlayers);
    setMatches(prev => prev.filter(m => m.id !== matchId));

    // Sync to Supabase
    await deleteMatchFromDB(matchId);
    const winner = updatedPlayers.find(p => p.id === winnerId);
    const loser = updatedPlayers.find(p => p.id === loserId);
    if (winner) await syncPlayer(winner);
    if (loser) await syncPlayer(loser);
    showToast('Match deleted');
  };

  /* Report score and update points */
  const reportScore = async ({ matchId, winnerId, scoreStr, sets }) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    const loserId = winnerId === match.a ? match.b : match.a;
    const winnerSide = winnerId === match.a ? 'a' : 'b';
    const earned = calcPoints(sets, winnerSide);
    const winnerPoints = winnerSide === 'a' ? earned.a : earned.b;
    const loserPoints  = winnerSide === 'a' ? earned.b : earned.a;

    const newPlayers = players.map(p => {
      if (p.id === winnerId) return {
        ...p,
        points: p.points + winnerPoints,
        wins: p.wins + 1,
        streak: p.streak >= 0 ? p.streak + 1 : 1,
      };
      if (p.id === loserId) return {
        ...p,
        points: Math.max(0, p.points + loserPoints),
        losses: p.losses + 1,
        streak: p.streak <= 0 ? p.streak - 1 : -1,
      };
      return p;
    });
    setPlayers(newPlayers);

    const updatedMatch = { ...matches.find(m => m.id === matchId), status: 'completed', winnerId, score: scoreStr, sets, date: new Date().toISOString().slice(0,10), winnerChange: winnerPoints, loserChange: loserPoints, change: winnerId === currentUserId ? winnerPoints : loserPoints };
    setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));

    // Sync to Supabase
    await syncMatch(updatedMatch);
    const updatedWinner = newPlayers.find(p => p.id === winnerId);
    const updatedLoser = newPlayers.find(p => p.id === loserId);
    if (updatedWinner) await syncPlayer(updatedWinner);
    if (updatedLoser) await syncPlayer(updatedLoser);

    // Email both players
    const winner = find(players, winnerId);
    const loser = find(players, loserId);
    const emailBoth = async (recipient, isWinner) => {
      if (!recipient?.email) return;
      await sendEmail({
        to: recipient.email,
        subject: isWinner ? `🎾 Match result: You won!` : `🎾 Match result recorded`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #C4522A;">${isWinner ? '🏆 You won!' : 'Match result recorded'}</h2>
            <p>A match result has been submitted on <strong>Los Feliz Tennis Club</strong>.</p>
            <table style="margin: 16px 0; border-collapse: collapse;">
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">🏆 Winner</td><td><strong>${winner?.name}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">📊 Score</td><td><strong>${scoreStr}</strong></td></tr>
              <tr><td style="color: #7A6548; padding: 4px 12px 4px 0;">✨ Points</td><td><strong>${isWinner ? `+${winnerPoints}` : `+${loserPoints}`} pts</strong></td></tr>
            </table>
            <p>Log in to <a href="https://baseline-alpha.vercel.app" style="color: #C4522A;">Baseline</a> to view the updated ladder.</p>
            <p style="color: #7A6548; font-size: 13px;">— The Los Feliz Tennis Club Team</p>
          </div>
        `,
      });
    };
    await emailBoth(winner, true);
    await emailBoth(loser, false);

    showToast(winnerId === currentUserId ? `Won! +${winnerPoints} pts` : loserId === currentUserId ? `+${loserPoints} pts earned` : 'Score saved');
  };

  const me = find(players, currentUserId);
  const myRank = rankOf(players, currentUserId);
  const ranked = useMemo(() => {
    const streakMap = {};
    players.forEach(p => {
      const myMatches = matches
        .filter(m => m.status === 'completed' && (m.a === p.id || m.b === p.id))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      let wins = 0, losses = 0;
      for (const m of myMatches) {
        if (m.winnerId === p.id) { if (losses === 0) wins++; else break; }
        else { if (wins === 0) losses++; else break; }
      }
      const recentForm = myMatches.slice(0, 5).map(m => m.winnerId === p.id ? 'W' : 'L');
      streakMap[p.id] = { wins, losses, recentForm };
    });
    return rank(players).map(p => ({
      ...p,
      liveStreak: streakMap[p.id]?.wins || 0,
      lossStreak: streakMap[p.id]?.losses || 0,
      recentForm: streakMap[p.id]?.recentForm || [],
    }));
  }, [players, matches]);

  if (!loggedIn || !me) {
    return <LoginScreen players={players} passwords={passwords} onLogin={handleLogin} />;
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: '#E8DCC8',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: C.ink,
      }}
    >
      <PaperTexture />

      <div className="relative max-w-md mx-auto pb-32" style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}>
        <Header />

        <div className="px-5">
          {tab === 'ladder' && (
            <LadderView ranked={ranked} matches={matches} myId={currentUserId} isAdmin={isAdmin()} onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })} onToggleActive={togglePlayerActive} onChallenge={(opp) => setModal({ kind: 'challenge', payload: opp })} />
          )}
          {tab === 'matches' && (
            <MatchesView
              matches={matches}
              players={players}
              myId={currentUserId}
              onAccept={acceptMatch}
              onDecline={declineMatch}
              onCancel={cancelMatch}
              onReport={(m) => setModal({ kind: 'report', payload: m })}
              onChallenge={(opp) => setModal({ kind: 'challenge', payload: opp })}
              onDelete={deleteMatch}
              onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })}
            />
          )}
          {tab === 'contacts' && (
            <ContactsView players={players} myId={currentUserId} isAdmin={isAdmin()} canManagePasswords={canManagePasswords()} onResetPassword={resetUserPassword} onViewProfile={(player) => setModal({ kind: 'playerDetail', payload: player })} onToggleActive={togglePlayerActive} />
          )}
          {tab === 'profile' && (
            <ProfileView me={me} myRank={myRank} matches={matches} players={players} onChangePassword={changePassword} onUpdateProfile={updateProfile} onDeleteMatch={deleteMatch} isAdmin={isAdmin()} onReset={reset} onSignOut={handleSignOut} />
          )}
        </div>
      </div>

      <BottomTabs tab={tab} setTab={setTab} pendingCount={matches.filter(m => m.status === 'scheduled' && (m.a === currentUserId || m.b === currentUserId)).length} />

      {modal?.kind === 'challenge' && (
        <ChallengeModal
          opponent={modal.payload}
          me={me}
          onClose={() => setModal(null)}
          onSubmit={(data) => { proposeChallenge(data); setModal(null); }}
        />
      )}
      {modal?.kind === 'report' && (
        <ReportModal
          match={modal.payload}
          players={players}
          myId={currentUserId}
          onClose={() => setModal(null)}
          onSubmit={(data) => { reportScore(data); setModal(null); }}
        />
      )}
      {modal?.kind === 'playerDetail' && (
        <PlayerDetailModal
          player={modal.payload}
          players={players}
          matches={matches}
          myId={currentUserId}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <Toast msg={toast} />}
    </div>
  );
}

/* ============================================================
   PAPER TEXTURE BACKGROUND
   ============================================================ */
function PaperTexture() {
  return (
    <>
      {/* Beige base */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: '#E8DCC8' }} />
      {/* Paper grain — warm tone */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.55,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0.9 0.1 0 0 0.05 0.1 0.8 0.05 0 0.02 0 0.05 0.7 0 0 0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        }}
      />
      {/* Warm vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 50%, rgba(160,110,60,0.12) 100%)' }}
      />
      {/* Faint court lines */}
      <svg className="fixed inset-0 pointer-events-none w-full h-full" style={{ opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#7A5C30" strokeWidth="3"/>
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#7A5C30" strokeWidth="1.5"/>
        <line x1="50%" y1="0" x2="50%" y2="35%" stroke="#7A5C30" strokeWidth="1.5"/>
      </svg>
    </>
  );
}

/* ============================================================
   BASELINE LOGO
   ============================================================ */
function BaselineLogo({ size = 36 }) {
  return (
    <img
      src="data:image/png;base64,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"
      alt="Los Feliz Tennis Club"
      style={{ height: size * 2.5, width: 'auto', objectFit: 'contain' }}
    />
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header() {
  return (
    <div className="relative">
      <div className="relative px-5 pt-20 pb-16 overflow-hidden" style={{ background: 'transparent' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.35 }} preserveAspectRatio="none">
          {/* Court boundary */}
          <rect x="3%" y="10%" width="94%" height="80%" fill="none" stroke={C.clay} strokeWidth="2.5"/>
          {/* Net — extends well beyond court */}
          <line x1="50%" y1="-10%" x2="50%" y2="110%" stroke={C.clay} strokeWidth="3"/>
          {/* Service lines */}
          <line x1="27%" y1="10%" x2="27%" y2="90%" stroke={C.clay} strokeWidth="1.5"/>
          <line x1="73%" y1="10%" x2="73%" y2="90%" stroke={C.clay} strokeWidth="1.5"/>
          {/* Center service line */}
          <line x1="27%" y1="50%" x2="73%" y2="50%" stroke={C.clay} strokeWidth="1.5"/>
        </svg>
        <div className="absolute inset-0 flex items-center pointer-events-none" style={{ left: '3%', width: '47%' }}>
          <div className="w-full flex justify-center">
            <BaselineLogo size={36} />
          </div>
        </div>
        <div style={{ height: 36 }} />
      </div>
    </div>
  );
}

function ClubCrest({ size = 32 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      {/* Crossed rackets */}
      <line x1="14" y1="14" x2="34" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="14" x2="14" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
      {/* Ball */}
      <circle cx="24" cy="13" r="3.5" fill={C.optic} />
      <path d="M21.5 13 Q24 10.5, 26.5 13" fill="none" stroke="white" strokeWidth="0.8"/>
      {/* TC letters */}
      <text x="24" y="27" textAnchor="middle" fontFamily="serif" fontSize="10" fontWeight="700" fill="white" opacity="0.9">TC</text>
    </svg>
  );
}

function StreakBadge({ streak }) {
  if (streak === 0) return null;
  const isWin = streak > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.1em]"
      style={{
        background: isWin ? C.optic : 'rgba(0,0,0,0.2)',
        color: isWin ? C.clayDeep : 'rgba(255,255,255,0.8)',
        fontFamily: '"JetBrains Mono", monospace',
        border: isWin ? 'none' : '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {isWin ? '▲' : '▼'} {Math.abs(streak)} {isWin ? 'W' : 'L'}
    </span>
  );
}

/* ============================================================
   LADDER VIEW
   ============================================================ */
function LadderView({ ranked, matches, myId, isAdmin, onViewProfile, onToggleActive, onChallenge }) {
  const [showInactive, setShowInactive] = useState(false);

  const visiblePlayers = useMemo(() => {
    if (isAdmin && showInactive) return ranked;
    return ranked.filter(p => p.isActive !== false);
  }, [ranked, isAdmin, showInactive]);

  const hasOpenWith = (oppId) => matches.some(m =>
    m.status === 'scheduled' &&
    ((m.a === myId && m.b === oppId) || (m.b === myId && m.a === oppId))
  );

  const inactiveCount = ranked.filter(p => p.isActive === false).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeading kicker="Standings" title="Ladder" />
        {isAdmin && inactiveCount > 0 && (
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded"
            style={{ color: showInactive ? C.clay : C.inkMute, border: `1px solid ${showInactive ? C.clay : C.line}` }}
          >
            {showInactive ? `Hide ${inactiveCount}` : `Show ${inactiveCount} hidden`}
          </button>
        )}
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${C.parchmentDeep}` }}
      >
        {visiblePlayers.map((p, idx) => {
          const realRank = ranked.findIndex(r => r.id === p.id) + 1;
          const isMe = p.id === myId;
          return (
            <PlayerRow
              key={p.id}
              player={p}
              rank={realRank}
              isMe={isMe}
              isAdmin={isAdmin}
              matches={matches}
              onViewProfile={() => onViewProfile(p)}
              onToggleActive={() => onToggleActive(p.id)}
              onChallenge={!isMe ? () => onChallenge(p) : null}
              hasOpen={!isMe && hasOpenWith(p.id)}
              isLast={idx === visiblePlayers.length - 1}
            />
          );
        })}
      </div>

      <div className="mt-4 text-[11px] leading-relaxed" style={{ color: C.inkMute }}>
        <span style={{ color: C.clay, fontWeight: 600 }}>How it works.</span> Challenge anyone on the ladder.
        Everyone earns <strong>1 pt</strong> for playing, <strong>1 pt per set won</strong>, and a
        <strong> bonus pt</strong> for winning in straight sets. Rankings are decided by total points accumulated.
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full transition-all"
      style={{
        background: active ? C.ink : 'transparent',
        color: active ? C.parchment : C.inkMute,
        border: `1px solid ${active ? C.ink : C.line}`,
      }}
    >
      {children}
    </button>
  );
}

function PlayerRow({ player, rank, isMe, isAdmin, matches, onViewProfile, onToggleActive, onChallenge, hasOpen, isLast }) {
  const isHidden = player.isActive === false;
  const podiumBg = rank === 1 ? 'rgba(232,201,58,0.12)' : rank === 2 ? 'rgba(180,180,190,0.12)' : rank === 3 ? 'rgba(180,120,60,0.10)' : null;
  const rankColor = rank === 1 ? C.opticDeep : rank === 2 ? '#7A8090' : rank === 3 ? '#8B6020' : C.inkMute;

  return (
    <div
      className="flex items-center gap-3 pr-4 pl-2 py-4"
      style={{
        background: isMe ? `${C.optic}30` : isHidden ? `${C.inkMute}10` : (podiumBg || 'transparent'),
        borderBottom: isLast ? 'none' : `1px solid ${C.parchmentDeep}`,
        opacity: isHidden ? 0.55 : 1,
      }}
    >
      <div
        style={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 900,
          fontSize: 15,
          color: rankColor,
          fontVariantNumeric: 'tabular-nums',
          width: 22,
          textAlign: 'right',
          lineHeight: 1,
        }}
      >
        {rank}
      </div>
      <button onClick={onViewProfile} className="flex-shrink-0" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        {player.profileImage ? (
          <img
            src={player.profileImage}
            alt={player.name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.line}` }}
          />
        ) : (
          <Avatar name={player.name} size={56} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1 mb-0.5 min-w-0">
          <button
            onClick={onViewProfile}
            className="font-bold truncate"
            style={{ fontSize: 15, color: C.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: '"Fraunces", serif', minWidth: 0 }}
          >
            {player.name}{isMe && <span style={{ color: C.clay, fontWeight: 600 }}> · you</span>}
          </button>
          {player.liveStreak >= 3 && <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🔥</span>}
          {player.lossStreak >= 3 && <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>🥶</span>}
        </div>
        {/* Stats row */}
        <div className="flex items-start gap-3">
          {player.ustaRating && (
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
              {player.ustaRating}
            </span>
          )}
          <div>
            <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>Pts</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: C.clay, fontWeight: 700, lineHeight: 1.2 }}>{player.points}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>W–L</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>{player.wins}–{player.losses}</div>
          </div>
          {player.recentForm && player.recentForm.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, lineHeight: 1 }}>Run</div>
              <div className="flex items-center gap-0.5" style={{ height: 16, marginTop: 1 }}>
                {player.recentForm.map((result, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: result === 'W' ? C.win : C.loss,
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isMe && !isHidden && onChallenge && (
          hasOpen ? (
            <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 rounded flex-shrink-0" style={{ color: C.inkMute, border: `1px solid ${C.line}` }}>
              Pending
            </span>
          ) : (
            <button
              onClick={onChallenge}
              className="text-[9px] uppercase tracking-[0.1em] font-bold px-2 py-1 rounded flex-shrink-0"
              style={{ background: C.clay, color: 'white', whiteSpace: 'nowrap' }}
            >
              Challenge
            </button>
          )
        )}
      </div>
    </div>
  );
}

function Avatar({ name, size = 32 }) {
  const bg = '#F5C842';
  const text = initials(name);
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, borderRadius: '50%' }}
    >
      <circle cx={r} cy={r} r={r} fill={bg} />
      <text
        x="50%" y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill={C.clayDeep}
        fontSize={size * 0.38}
        fontFamily='"Fraunces", serif'
        fontWeight="700"
        letterSpacing="0.03em"
      >
        {text}
      </text>
    </svg>
  );
}

/* ============================================================
   MATCHES VIEW
   ============================================================ */
function MatchesView({ matches, players, myId, onAccept, onDecline, onCancel, onReport, onChallenge, onDelete, onViewProfile }) {
  const [sub, setSub] = useState('open');
  const [search, setSearch] = useState('');

  const myMatches = matches.filter(m => m.a === myId || m.b === myId);
  const open = myMatches.filter(m => m.status === 'scheduled');
  const history = myMatches.filter(m => m.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));

  const visible = sub === 'open' ? open : history;

  const hasOpenWith = (oppId) => myMatches.some(m =>
    m.status === 'scheduled' &&
    ((m.a === myId && m.b === oppId) || (m.b === myId && m.a === oppId))
  );

  const searchResults = search.trim().length > 0
    ? players.filter(p =>
        p.id !== myId &&
        p.isActive !== false &&
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      <SectionHeading kicker="Your fixtures" title="Matches" />

      {/* Player search to challenge */}
      <div className="mb-4 relative">
        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.inkMute, pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search players to challenge..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '13px 12px 13px 36px',
            border: `1.5px solid ${search ? C.clay : C.line}`,
            borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.90)', color: C.ink,
            outline: 'none',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden" style={{ border: `1.5px solid ${C.parchmentDeep}` }}>
          {searchResults.map((p, idx) => {
            const alreadyChallenged = hasOpenWith(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.90)',
                  borderBottom: idx < searchResults.length - 1 ? `1px solid ${C.line}` : 'none',
                }}
              >
                <Avatar name={p.name} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 14, fontFamily: '"Fraunces", serif', color: C.ink }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>
                    {p.points} pts · {p.wins}–{p.losses}
                  </div>
                </div>
                {alreadyChallenged ? (
                  <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>Open match</span>
                ) : (
                  <button
                    onClick={() => { onChallenge(p); setSearch(''); }}
                    className="text-[10px] uppercase tracking-[0.12em] font-bold px-3 py-1.5 rounded"
                    style={{ background: C.clay, color: 'white' }}
                  >
                    Challenge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {search.trim().length > 0 && searchResults.length === 0 && (
        <div className="mb-4 rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.5)', border: `1px solid ${C.line}` }}>
          <div className="text-[12px]" style={{ color: C.inkMute }}>No players found</div>
        </div>
      )}

      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: C.parchmentWarm }}>
        {[
          { id: 'open', label: 'Challenges', count: open.length },
          { id: 'history', label: 'History', count: history.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className="flex-1 text-[11px] uppercase tracking-[0.12em] font-semibold py-2 rounded transition-all"
            style={{
              background: sub === t.id ? C.ink : 'transparent',
              color: sub === t.id ? C.parchment : C.inkMute,
            }}
          >
            {t.label} {t.count > 0 && <span style={{ opacity: 0.7 }}>· {t.count}</span>}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <EmptyState
          icon={<Activity size={20} />}
          title={sub === 'open' ? 'No challenges' : 'No matches yet'}
          subtitle={sub === 'history' ? 'Your match history will live here.' : 'Search for a player above or head to the ladder to challenge someone.'}
        />
      )}

      <div className="space-y-3">
        {visible.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            players={players}
            myId={myId}
            onAccept={() => onAccept(m.id)}
            onDecline={() => onDecline(m.id)}
            onCancel={() => onCancel(m.id)}
            onReport={() => onReport(m)}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>

      {/* Club-wide activity feed */}
      <div className="mt-6">
        <div className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: C.inkMute }}>
          Club Activity
        </div>
        <ActivityView matches={matches} players={players} onViewProfile={onViewProfile} />
      </div>
    </div>
  );
}

function MatchCard({ match, players, myId, onAccept, onDecline, onCancel, onReport, onDelete }) {
  const opponent = match.a === myId ? find(players, match.b) : find(players, match.a);

  if (match.status === 'completed') {
    const won = match.winnerId === myId;
    const ranked = rank(players);
    const oppRank = ranked.findIndex(p => p.id === opponent?.id) + 1;
    return (
      <div
        className="rounded-lg px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: `1px solid ${C.line}`,
          borderLeft: `4px solid ${won ? C.win : C.loss}`,
        }}
      >
        {/* Top row: W/L + opponent + delete */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
            <span className="text-[14px] font-semibold truncate" style={{ fontFamily: '"Fraunces", serif', color: C.ink }}>{opponent?.name}</span>
            <span className="text-[11px] flex-shrink-0" style={{ color: C.inkMute }}>#{oppRank}</span>
          </div>
          <button
            onClick={() => onDelete()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '4px', flexShrink: 0 }}
          >
            <X size={13} />
          </button>
        </div>
        {/* Bottom row: score + pts + date */}
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.inkMute }}>{match.score}</span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{match.change} pts</span>
            <span className="text-[11px]" style={{ color: C.inkMute }}>{fmtDate(match.date)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (match.status === 'pending' || match.status === 'scheduled') {
    return (
      <div
        className="rounded-lg p-4"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1.5px solid ${C.clay}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.clay }}>
            Challenge
          </span>
          <span className="text-[10px]" style={{ color: C.inkMute }}>
            {fmtDate(match.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Avatar name={opponent.name} size={44} />
          <div className="flex-1">
            <div className="font-semibold text-sm">{opponent.name}</div>
            <div className="text-[11px]" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>
              {opponent.points} pts · {opponent.wins}–{opponent.losses}
            </div>
          </div>
        </div>
        {(match.proposedDate || match.location) && (
          <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: C.inkMute }}>
            {match.proposedDate && <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDateTime(match.proposedDate)}</span>}
            {match.location && <span className="flex items-center gap-1"><MapPin size={11} /> {match.location}</span>}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onReport}
            className="flex-1 text-[12px] font-semibold py-2 rounded uppercase tracking-[0.1em]"
            style={{ background: C.ink, color: C.parchment }}
          >
            Report Score
          </button>
          <button
            onClick={onCancel}
            className="text-[12px] font-semibold py-2 px-3 rounded uppercase tracking-[0.1em]"
            style={{ background: 'transparent', color: C.inkMute, border: `1px solid ${C.line}` }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // scheduled
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: C.ink,
        color: C.parchment,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.optic }}>
          Match on
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {fmtDateTime(match.proposedDate)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Avatar name={opponent.name} size={44} />
        <div className="flex-1">
          <div className="font-semibold text-sm">vs {opponent.name}</div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"JetBrains Mono", monospace' }}>
            {opponent.points} pts · #{rankOf(players, opponent.id)}
          </div>
        </div>
      </div>
      <div className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <MapPin size={11} /> {match.location}
      </div>
      <button
        onClick={onReport}
        className="w-full text-[12px] font-semibold py-2 rounded uppercase tracking-[0.1em]"
        style={{ background: C.optic, color: C.ink }}
      >
        Report Score
      </button>
    </div>
  );
}

/* ============================================================
   CONTACTS VIEW
   ============================================================ */
function ContactsView({ players, myId, isAdmin, canManagePasswords, onResetPassword, onViewProfile, onToggleActive }) {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Filter players based on search and active status
  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()));
    const matchesActive = (isAdmin && showInactive) || p.isActive !== false;
    return matchesSearch && matchesActive;
  });

  const inactiveCount = players.filter(p => p.isActive === false).length;

  const handleResetPassword = (playerEmail, playerName) => {
    if (window.confirm(`Reset password for ${playerName} to default (tennis123)?`)) {
      onResetPassword(playerEmail);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeading kicker="Club directory" title="Contacts" />
        {isAdmin && inactiveCount > 0 && (
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded"
            style={{ color: showInactive ? C.clay : C.inkMute, border: `1px solid ${showInactive ? C.clay : C.line}` }}
          >
            {showInactive ? `Hide ${inactiveCount}` : `Show ${inactiveCount} hidden`}
          </button>
        )}
      </div>

      {canManagePasswords && (
        <div className="mb-4 rounded-lg p-3" style={{ background: `${C.optic}50`, border: `1px solid ${C.opticDeep}` }}>
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: C.ink }} />
            <span className="text-[11px] font-semibold" style={{ color: C.ink }}>
              Password Manager Access
            </span>
          </div>
          <div className="text-[10px] mt-1" style={{ color: C.inkMute }}>
            You can reset passwords for any player
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.inkMute }} />
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 12px 13px 36px',
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.88)',
          }}
        />
      </div>

      <div className="space-y-2">
        {filtered.map(p => {
          const isHidden = p.isActive === false;
          return (
          <div
            key={p.id}
            className="p-4 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}`, opacity: isHidden ? 0.6 : 1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => onViewProfile(p)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                {p.profileImage ? (
                  <img 
                    src={p.profileImage} 
                    alt={p.name}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.line}` }}
                  />
                ) : (
                  <Avatar name={p.name} size={40} />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewProfile(p)}
                    className="font-semibold text-sm"
                    style={{ color: C.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    {p.name}{p.id === myId && <span style={{ color: C.clay }}> (you)</span>}
                  </button>
                  {p.ustaRating && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                      {p.ustaRating}
                    </span>
                  )}
                  {isHidden && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: C.inkMute, color: C.parchment, fontWeight: 600 }}>
                      HIDDEN
                    </span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: C.inkMute }}>
                  #{rankOf(players, p.id)} · {p.points} pts · {p.wins}-{p.losses}
                </div>
              </div>
            </div>
            {p.email && (
              <div className="flex items-center gap-2 mb-1">
                <Mail size={12} style={{ color: C.inkMute }} />
                <a href={`mailto:${p.email}`} className="text-[12px]" style={{ color: C.green }}>
                  {p.email}
                </a>
              </div>
            )}
            {p.phone && (
              <div className="flex items-center gap-2 mb-1">
                <Phone size={12} style={{ color: C.inkMute }} />
                <a href={`tel:${p.phone}`} className="text-[12px]" style={{ color: C.inkMute }}>
                  {p.phone}
                </a>
              </div>
            )}
            {(isAdmin || canManagePasswords) && p.id !== myId && (
              <div className="mt-2 pt-2 flex gap-2" style={{ borderTop: `1px dashed ${C.line}` }}>
                {isAdmin && (
                  <button
                    onClick={() => onToggleActive(p.id)}
                    className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded flex items-center gap-1"
                    style={{ background: C.inkMute, color: C.parchment }}
                  >
                    <User size={10} />
                    {isHidden ? 'Show' : 'Hide'}
                  </button>
                )}
                {canManagePasswords && (
                  <button
                    onClick={() => handleResetPassword(p.email, p.name)}
                    className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded flex items-center gap-1"
                    style={{ background: C.clay, color: C.parchment }}
                  >
                    <Lock size={10} />
                    Reset Password
                  </button>
                )}
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE VIEW
   ============================================================ */

function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const [scale, setScale] = React.useState(1);
  const [ox, setOx] = React.useState(0);
  const [oy, setOy] = React.useState(0);
  const [natW, setNatW] = React.useState(0);
  const [natH, setNatH] = React.useState(0);
  const dragRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const SIZE = 260;

  // base scale to cover the circle (object-fit: cover)
  const baseScale = natW && natH ? Math.max(SIZE / natW, SIZE / natH) : 1;
  // rendered size at scale=1
  const baseW = natW * baseScale;
  const baseH = natH * baseScale;

  const onMouseDown = (e) => { dragRef.current = { x: e.clientX, y: e.clientY, ox, oy }; };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    setOx(dragRef.current.ox + e.clientX - dragRef.current.x);
    setOy(dragRef.current.oy + e.clientY - dragRef.current.y);
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onTouchStart = (e) => { const t = e.touches[0]; dragRef.current = { x: t.clientX, y: t.clientY, ox, oy }; };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    setOx(dragRef.current.ox + t.clientX - dragRef.current.x);
    setOy(dragRef.current.oy + t.clientY - dragRef.current.y);
  };
  const onTouchEnd = () => { dragRef.current = null; };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img || !natW || !natH) return;
    const out = document.createElement('canvas');
    out.width = 400; out.height = 400;
    const ctx = out.getContext('2d');
    ctx.beginPath(); ctx.arc(200, 200, 200, 0, Math.PI * 2); ctx.clip();
    const r = 400 / SIZE;
    const w = baseW * scale * r;
    const h = baseH * scale * r;
    ctx.drawImage(img, 200 - w / 2 + ox * r, 200 - h / 2 + oy * r, w, h);
    out.toBlob(b => b ? onConfirm(b) : onCancel(), 'image/jpeg', 0.9);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.parchment, borderRadius: 16, padding: 20, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: C.inkMute }}>Crop Photo</div>
        <div
          style={{ width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden', background: '#111', cursor: 'grab', userSelect: 'none', touchAction: 'none', position: 'relative', flexShrink: 0 }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <img
            ref={imgRef}
            src={imageSrc} alt="" draggable={false}
            onLoad={(e) => { setNatW(e.target.naturalWidth); setNatH(e.target.naturalHeight); }}
            style={{
              position: 'absolute',
              width: baseW,
              height: baseH,
              left: SIZE / 2 - baseW / 2,
              top: SIZE / 2 - baseH / 2,
              transform: `translate(${ox}px, ${oy}px) scale(${scale})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.inkMute, marginBottom: 4 }}>Zoom</div>
          <input type="range" min="1" max="3" step="0.01" value={scale} onChange={e => setScale(+e.target.value)} style={{ width: '100%', accentColor: C.clay }} />
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.line}`, color: C.inkMute, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, borderRadius: 8, background: C.clay, color: 'white', border: 'none', cursor: 'pointer' }}>Use Photo</button>
        </div>
      </div>
    </div>
  );
}


function ProfileView({ me, myRank, matches, players, onChangePassword, onUpdateProfile, onDeleteMatch, isAdmin, onReset, onSignOut }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [ustaRating, setUstaRating] = useState(me.ustaRating || '');
  const [cropSrc, setCropSrc] = useState(null);

  const myCompleted = matches.filter(m => (m.a === me.id || m.b === me.id) && m.status === 'completed');
  const winRate = me.wins + me.losses === 0 ? 0 : Math.round((me.wins / (me.wins + me.losses)) * 100);
  const totalMatches = me.wins + me.losses;

  // Build point history from completed matches
  const history = useMemo(() => {
    const sorted = [...myCompleted].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let running = 0;
    const points = sorted.map(m => {
      running += (m.change || 0);
      return { date: m.date ? m.date.slice(5) : '—', points: running };
    });
    return points.length > 0 ? points : [{ date: 'Start', points: 0 }];
  }, [myCompleted]);

  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onChangePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target && ev.target.result) setCropSrc(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob) => {
    setCropSrc(null);
    try {
      const fileName = `${me.id}-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('', blob);
      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`,
        { method: 'POST', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, body: formData }
      );
      if (!uploadRes.ok) throw new Error('Upload failed');
      onUpdateProfile({ profileImage: `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}` });
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target && ev.target.result) onUpdateProfile({ profileImage: ev.target.result }); };
      reader.readAsDataURL(blob);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ ustaRating });
    setEditingProfile(false);
  };

  return (
    <div>
      {cropSrc && <ImageCropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />}
      <SectionHeading kicker="Player card" title="Your Profile" />

      {/* Inactive Status Alert */}
      {me.isActive === false && (
        <div className="mb-4 rounded-lg p-4" style={{ background: `${C.inkMute}20`, border: `2px solid ${C.inkMute}` }}>
          <div className="flex items-center gap-2 mb-2">
            <User size={16} style={{ color: C.inkMute }} />
            <span className="text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>
              Inactive Profile
            </span>
          </div>
          <div className="text-[12px]" style={{ color: C.inkMute }}>
            This profile is currently hidden from the ladder and contacts directory. Only admins can see and re-activate this account.
          </div>
        </div>
      )}

      {/* Combined player card */}
      <div
        className="relative rounded-lg p-5 mb-4 overflow-hidden"
        style={{ background: C.green, color: C.parchment }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }} preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="3"/>
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="white" strokeWidth="1.5"/>
          <line x1="50%" y1="0" x2="50%" y2="70%" stroke="white" strokeWidth="1.5"/>
        </svg>
        <div className="absolute right-0 top-0 bottom-0 opacity-15" style={{ width: 120, background: `radial-gradient(circle at center, ${C.optic} 0%, transparent 70%)` }} />

        {/* Photo + name */}
        <div className="flex items-start gap-4 mb-4 relative">
          <div className="relative flex-shrink-0">
            {me.profileImage ? (
              <img src={me.profileImage} alt={me.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
            ) : (
              <Avatar name={me.name} size={72} />
            )}
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: C.clay, color: 'white', border: '2px solid rgba(255,255,255,0.6)' }}>
              <User size={12} />
              <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, marginBottom: 4 }}>
              {me.name}
            </div>
            {editingProfile ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  placeholder="USTA rating e.g. 4.5"
                  value={ustaRating}
                  onChange={e => setUstaRating(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, fontSize: 14, background: 'rgba(255,255,255,0.15)', color: 'white' }}
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex-1 py-1.5 text-[10px] font-semibold rounded uppercase tracking-[0.1em]" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Save</button>
                  <button onClick={() => { setEditingProfile(false); setUstaRating(me.ustaRating || ''); }} className="flex-1 py-1.5 text-[10px] font-semibold rounded uppercase tracking-[0.1em]" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {me.ustaRating && (
                  <span className="text-[11px] font-bold" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.optic }}>{me.ustaRating} USTA</span>
                )}
                <button onClick={() => setEditingProfile(true)} className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded" style={{ border: '1px solid rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.7)' }}>
                  {me.ustaRating ? 'Edit' : 'Add USTA'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 relative">
          <Stat label="Rank" value={`#${myRank}`} accent={C.optic} />
          <Stat label="Points" value={me.points} mono />
          <Stat label="Win %" value={`${winRate}%`} accent={winRate >= 50 ? C.optic : C.clayLight} />
        </div>
      </div>
      <div className="mb-4 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lock size={14} style={{ color: C.inkMute }} />
            <span className="text-[12px] font-semibold" style={{ color: C.ink }}>Password</span>
          </div>
          {!showPasswordChange && (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="text-[11px] uppercase tracking-[0.1em] px-2 py-1 rounded"
              style={{ color: C.clay, border: `1px solid ${C.clay}` }}
            >
              Change
            </button>
          )}
        </div>
        {showPasswordChange ? (
          <div className="space-y-2 mt-3">
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: C.parchmentWarm }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: C.parchmentWarm }}
            />
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="flex-1 py-2 text-[11px] font-semibold rounded uppercase tracking-[0.1em]"
                style={{ background: C.ink, color: C.parchment }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2 text-[11px] font-semibold rounded uppercase tracking-[0.1em]"
                style={{ border: `1px solid ${C.line}`, color: C.inkMute }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px]" style={{ color: C.inkMute }}>
            ••••••••
          </div>
        )}
      </div>

      <div
        className="rounded-lg p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: C.inkMute }}>
            Points Trend
          </div>
          <div className="text-[10px]" style={{ color: C.inkMute }}>
            Last {history.length} matches
          </div>
        </div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.clay} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.clay} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.inkMute }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.inkMute }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  background: C.ink, border: 'none', borderRadius: 6,
                  color: C.parchment, fontSize: 11,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              />
              <Area
                type="monotone" dataKey="points"
                stroke={C.clay} strokeWidth={2}
                fill="url(#grad)"
                dot={{ fill: C.clay, r: 3 }}
                activeDot={{ fill: C.clay, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>Stats</div>
        <StatsPanel playerId={me.id} matches={matches} players={players} />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>
          Match History
        </div>
        {myCompleted.length === 0 ? (
          <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
            <div className="text-[12px]" style={{ color: C.inkMute }}>No matches played yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...myCompleted].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((m, idx) => {
              const opponent = m.a === me.id ? find(players, m.b) : find(players, m.a);
              const won = m.winnerId === me.id;
              const ranked = rank(players);
              const oppRank = ranked.findIndex(p => p.id === opponent?.id) + 1;
              return (
                <div
                  key={m.id}
                  className="rounded-lg px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}`, borderLeft: `4px solid ${won ? C.win : C.loss}` }}
                >
                  {/* Top row: W/L + opponent + delete */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold uppercase flex-shrink-0" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
                      <span className="text-[14px] font-semibold truncate" style={{ fontFamily: '"Fraunces", serif', color: C.ink }}>{opponent?.name || 'Unknown'}</span>
                      <span className="text-[11px] flex-shrink-0" style={{ color: C.inkMute }}>#{oppRank}</span>
                    </div>
                    <button
                      onClick={() => onDeleteMatch(m.id)}
                      title="Delete match"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '4px', flexShrink: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {/* Bottom row: score + pts + date */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.inkMute }}>{m.score}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{m.change} pts</span>
                      <span className="text-[11px]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Admin section */}
      {isAdmin && (
        <div className="mt-6 mb-4 rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: C.inkMute }}>Admin</div>
          <button
            onClick={() => { if (window.confirm('Reset all data to defaults? This cannot be undone.')) onReset(); }}
            className="w-full py-2.5 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
            style={{ background: 'transparent', border: `1px solid ${C.clay}`, color: C.clay }}
          >
            Reset Ladder to Defaults
          </button>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full py-3 mb-6 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
        style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.inkMute }}
      >
        Sign Out
      </button>
    </div>
  );
}

function Stat({ label, value, accent = C.parchment, mono }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : '"Fraunces", serif',
          fontWeight: 700,
          fontSize: 24,
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailStat({ icon, label, value, sublabel, mono, accent }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-1 mb-1" style={{ color: C.inkMute }}>
        {icon}
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">{label}</span>
      </div>
      <div
        style={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : '"Fraunces", serif',
          fontWeight: 700,
          fontSize: 22,
          color: accent || C.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: C.inkMute }}>
        {sublabel}
      </div>
    </div>
  );
}

/* ============================================================
   COMMON UI
   ============================================================ */
function SectionHeading({ kicker, title }) {
  return (
    <div className="mb-4 mt-3">
      <div className="text-[9px] uppercase tracking-[0.35em] mb-1.5" style={{ color: C.clay, fontWeight: 700 }}>
        {kicker}
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 26, lineHeight: 1, color: C.ink }}>
        {title}
      </div>
      {/* Court line underline */}
      <div className="flex items-center gap-1 mt-2">
        <div style={{ height: 3, width: 28, background: C.clay, borderRadius: 2 }} />
        <div style={{ height: 3, width: 8, background: C.optic, borderRadius: 2 }} />
        <div style={{ height: 1, flex: 1, background: C.line }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div
      className="rounded-lg py-10 text-center"
      style={{ background: 'rgba(255,255,255,0.82)', border: `1px dashed ${C.line}` }}
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2" style={{ background: C.parchmentWarm, color: C.inkMute }}>
        {icon}
      </div>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-[12px]" style={{ color: C.inkMute }}>{subtitle}</div>
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 text-[12px] font-bold z-50 uppercase tracking-[0.15em]"
      style={{
        background: C.clay,
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        animation: 'toast-in 0.25s ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   ACTIVITY VIEW — club-wide match feed
   ============================================================ */
function ActivityView({ matches, players, onViewProfile }) {
  const completed = [...matches]
    .filter(m => m.status === 'completed')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const ranked = rank(players);
  const getRank = (id) => ranked.findIndex(p => p.id === id) + 1;

  if (completed.length === 0) return (
    <div className="text-[12px] text-center py-4" style={{ color: C.inkMute }}>No matches played yet</div>
  );

  return (
    <div className="space-y-2">
      {completed.map(m => {
        const winner = find(players, m.winnerId);
        const loserId = m.a === m.winnerId ? m.b : m.a;
        const loser = find(players, loserId);
        if (!winner || !loser) return null;
        const wRank = getRank(winner.id);
        const lRank = getRank(loser.id);
        return (
          <div key={m.id} className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
            {/* Date + score on one line */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.ink, background: C.parchmentWarm, whiteSpace: 'nowrap' }}>{m.score}</span>
            </div>
            {/* Players row */}
            <div className="flex items-center justify-between gap-2">
              {/* Winner */}
              <button onClick={() => onViewProfile(winner)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                {winner.profileImage
                  ? <img src={winner.profileImage} alt={winner.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.win}` }} />
                  : <Avatar name={winner.name} size={36} />
                }
                <div className="text-left min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 12, fontFamily: '"Fraunces", serif', color: C.ink }}>{winner.name}</div>
                  <div style={{ fontSize: 10, color: C.win, fontWeight: 700 }}>#{wRank} · W</div>
                </div>
              </button>

              <div className="text-[10px] font-bold flex-shrink-0" style={{ color: C.line }}>vs</div>

              {/* Loser */}
              <button onClick={() => onViewProfile(loser)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                <div className="text-right min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 12, fontFamily: '"Fraunces", serif', color: C.ink }}>{loser.name}</div>
                  <div style={{ fontSize: 10, color: C.loss, fontWeight: 700 }}>#{lRank} · L</div>
                </div>
                {loser.profileImage
                  ? <img src={loser.profileImage} alt={loser.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.loss}` }} />
                  : <Avatar name={loser.name} size={36} />
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   BOTTOM TABS
   ============================================================ */
function BottomTabs({ tab, setTab, pendingCount }) {
  const PodiumIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {/* Cup body */}
      <path d="M5 2 H15 L13.5 11 Q13 14, 10 14 Q7 14, 6.5 11 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" strokeLinejoin="round"/>
      {/* Handles */}
      <path d="M5 4 Q2 4, 2 7 Q2 10, 5 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M15 4 Q18 4, 18 7 Q18 10, 15 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Stem */}
      <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Base */}
      <line x1="7" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  // Two rackets crossed in an X — clearer design
  const RacketsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {/* Racket 1: tilted left (top-right to bottom-left) */}
      {/* Head */}
      <ellipse cx="15.5" cy="5.5" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(35 15.5 5.5)"/>
      {/* Strings horizontal */}
      <line x1="12.5" y1="4" x2="17.5" y2="5.5" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(35 15 5)"/>
      <line x1="12" y1="6" x2="18" y2="7" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(35 15 5)"/>
      {/* Handle */}
      <line x1="13" y1="9" x2="5" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

      {/* Racket 2: tilted right (top-left to bottom-right) */}
      {/* Head */}
      <ellipse cx="6.5" cy="5.5" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" transform="rotate(-35 6.5 5.5)"/>
      {/* Strings horizontal */}
      <line x1="3.5" y1="4" x2="8.5" y2="5.5" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(-35 7 5)"/>
      <line x1="3" y1="6" x2="9" y2="7" stroke="currentColor" strokeWidth="0.7" opacity="0.6" transform="rotate(-35 7 5)"/>
      {/* Handle */}
      <line x1="9" y1="9" x2="17" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const TennisBallIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.35" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3.5 4.5 C6 7, 6 13, 3.5 15.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M16.5 4.5 C14 7, 14 13, 16.5 15.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  );

  // Multiple people icon
  const ContactsIcon = () => (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="currentColor">
      {/* Back person - left */}
      <circle cx="7" cy="5" r="2.8" opacity="0.6"/>
      <path d="M1 17 Q1 11, 7 11 Q10 11, 11 13" opacity="0.6"/>
      {/* Back person - right */}
      <circle cx="15" cy="5" r="2.8" opacity="0.6"/>
      <path d="M21 17 Q21 11, 15 11 Q12 11, 11 13" opacity="0.6"/>
      {/* Front person - center */}
      <circle cx="11" cy="4.5" r="3.2"/>
      <path d="M4 18 Q4 11.5, 11 11.5 Q18 11.5, 18 18"/>
    </svg>
  );

  const tabs = [
    { id: 'ladder',   label: 'Ladder',   icon: <PodiumIcon /> },
    { id: 'matches',  label: 'Matches',  icon: <RacketsIcon />, badge: pendingCount },
    { id: 'contacts', label: 'Contacts', icon: <ContactsIcon /> },
    { id: 'profile',  label: 'Profile',  icon: <TennisBallIcon /> },
  ];
  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto"
      style={{
        background: C.ink,
        borderTop: `3px solid ${C.clay}`,
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      <div className="flex justify-around px-2 pt-2 pb-1">
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all"
              style={{ color: active ? C.optic : 'rgba(255,255,255,0.4)' }}
            >
              {active && (
                <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: C.optic, borderRadius: '0 0 3px 3px' }} />
              )}
              <div className="relative">
                {t.icon}
                {t.badge > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ background: C.clay, color: 'white' }}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   STATS PANEL — shared by ProfileView and PlayerDetailModal
   ============================================================ */
function StatsPanel({ playerId, matches, players }) {
  const s = calcStats(playerId, matches, players);

  if (s.played === 0) return (
    <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
      <div className="text-[12px]" style={{ color: C.inkMute }}>No matches played yet</div>
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Top row: matches */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Played',    value: s.played,            color: C.ink },
          { label: 'Win Rate',  value: `${s.winRate}%`,     color: s.winRate >= 50 ? C.win : C.loss },
          { label: 'Won',       value: s.matchWins,         color: C.win },
          { label: 'Lost',      value: s.matchLosses,       color: C.loss },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div className="text-[9px] uppercase tracking-[0.12em] mt-1" style={{ color: C.inkMute }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sets row */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Sets</div>
        <div className="flex items-center gap-3">
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.win }}>{s.setsWon}</div>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: C.line }}>
            {s.setsWon + s.setsLost > 0 && (
              <div style={{ height: '100%', width: `${Math.round((s.setsWon / (s.setsWon + s.setsLost)) * 100)}%`, background: C.win, borderRadius: 9999 }} />
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.loss }}>{s.setsLost}</div>
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: C.inkMute }}>
          <span>Won</span><span>Lost</span>
        </div>
      </div>

      {/* Games row */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Games</div>
        <div className="flex items-center gap-3">
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.win }}>{s.gamesWon}</div>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: C.line }}>
            {s.gamesWon + s.gamesLost > 0 && (
              <div style={{ height: '100%', width: `${Math.round((s.gamesWon / (s.gamesWon + s.gamesLost)) * 100)}%`, background: C.green, borderRadius: 9999 }} />
            )}
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 700, color: C.loss }}>{s.gamesLost}</div>
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: C.inkMute }}>
          <span>Won</span><span>Lost</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PLAYER DETAIL MODAL
   ============================================================ */
function PlayerDetailModal({ player, players, matches, myId, onClose }) {
  const playerRank = rankOf(players, player.id);
  const isHidden = player.isActive === false;
  const playerMatches = matches.filter(m =>
    (m.a === player.id || m.b === player.id) && m.status === 'completed'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-5 pb-8 relative"
        style={{ background: C.parchment, maxHeight: '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', animation: 'slide-up 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: C.line }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <X size={20} style={{ color: C.inkMute }} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {player.profileImage
            ? <img src={player.profileImage} alt={player.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.clay}`, flexShrink: 0 }} />
            : <Avatar name={player.name} size={72} />
          }
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 22, color: C.ink, lineHeight: 1.1 }}>{player.name}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: C.inkMute }}>Rank #{playerRank} · {player.points} pts</span>
              {player.ustaRating && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.optic, color: C.ink, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                  USTA {player.ustaRating}
                </span>
              )}
            </div>
            
          </div>
        </div>

        {/* Inactive badge */}
        {isHidden && (
          <div className="mb-4 rounded-lg p-3" style={{ background: `${C.inkMute}20`, border: `2px solid ${C.inkMute}` }}>
            <div className="flex items-center gap-2 mb-1">
              <User size={13} style={{ color: C.inkMute }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: C.inkMute }}>Inactive Profile</span>
            </div>
            <div className="text-[10px]" style={{ color: C.inkMute }}>Hidden from the ladder and contacts directory.</div>
          </div>
        )}

        {/* Contact */}
        {(player.email || player.phone) && (
          <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(255,255,255,0.88)', border: `1px solid ${C.line}` }}>
            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Contact</div>
            {player.email && (
              <div className="flex items-center gap-2 mb-1">
                <Mail size={12} style={{ color: C.inkMute }} />
                <a href={`mailto:${player.email}`} className="text-[12px]" style={{ color: C.green }}>{player.email}</a>
              </div>
            )}
            {player.phone && (
              <div className="flex items-center gap-2">
                <Phone size={12} style={{ color: C.inkMute }} />
                <a href={`tel:${player.phone}`} className="text-[12px]" style={{ color: C.inkMute }}>{player.phone}</a>
              </div>
            )}
          </div>
        )}

        {/* Full stats */}
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>Stats</div>
        <StatsPanel playerId={player.id} matches={matches} players={players} />

        {/* Match history */}
        {playerMatches.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: C.inkMute }}>
              Match History
            </div>
            <div className="space-y-1">
              {[...playerMatches].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(m => {
                const won = m.winnerId === player.id;
                const oppId = m.a === player.id ? m.b : m.a;
                const opp = find(players, oppId);
                const oppRank = rank(players).findIndex(p => p.id === oppId) + 1;
                return (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}`, borderLeft: `3px solid ${won ? C.win : C.loss}` }}>
                    <span className="text-[10px] font-bold flex-shrink-0 w-3" style={{ color: won ? C.win : C.loss }}>{won ? 'W' : 'L'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-semibold truncate" style={{ color: C.ink }}>{opp?.name || 'Unknown'}</span>
                      <span className="text-[10px] ml-1" style={{ color: C.inkMute }}>#{oppRank}</span>
                    </div>
                    <div className="text-[10px] flex-shrink-0" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>{m.score}</div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-bold" style={{ color: won ? C.win : C.loss }}>{won ? '+' : ''}{m.change}</div>
                      <div className="text-[9px]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CHALLENGE MODAL
   ============================================================ */
function ChallengeModal({ opponent, me, onClose, onSubmit }) {
  const [date, setDate] = useState(() => {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [location, setLocation] = useState(VENUES[0]);
  const [customLocation, setCustomLocation] = useState('');

  const finalLocation = location === 'Other' ? customLocation : location;

  return (
    <ModalShell onClose={onClose}>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: C.clay }}>
        New Challenge
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 24, lineHeight: 1.1, color: C.ink }} className="mb-4">
        vs {opponent.name}
      </div>
      <div className="flex items-center gap-3 mb-4 p-3 rounded" style={{ background: C.parchmentWarm }}>
        <Avatar name={opponent.name} size={40} />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.inkMute }}>Points</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: C.ink }}>{opponent.points} pts</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.15em]" style={{ color: C.inkMute }}>Record</div>
          <div className="font-semibold text-sm">{opponent.wins}–{opponent.losses}</div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1.5" style={{ color: C.inkMute }}>
            When
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded text-sm"
            style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1.5" style={{ color: C.inkMute }}>
            Where
          </label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 rounded text-sm"
            style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
          >
            {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {location === 'Other' && (
            <input
              type="text"
              placeholder="Enter location..."
              value={customLocation}
              onChange={e => setCustomLocation(e.target.value)}
              className="w-full px-3 py-2.5 rounded text-sm mt-2"
              style={{ background: C.parchmentWarm, border: `1px solid ${C.line}`, color: C.ink, fontFamily: '"DM Sans", sans-serif' }}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
          style={{ border: `1px solid ${C.line}`, color: C.inkMute }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ opponentId: opponent.id, date, location: finalLocation })}
          className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]"
          style={{ background: C.clay, color: 'white' }}
        >
          Send Challenge
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   REPORT SCORE MODAL
   ============================================================ */
function ReportModal({ match, players, myId, onClose, onSubmit }) {
  const playerA = find(players, match.a);
  const playerB = find(players, match.b);
  const myPlayer = find(players, myId);
  const [sets, setSets] = useState([{ a: 0, b: 0 }, { a: 0, b: 0 }, null]);
  const [thirdSetType, setThirdSetType] = useState('full');
  const [tiebreaks, setTiebreaks] = useState({ 0: null, 1: null });

  const updateSet = (idx, who, val) => {
    const is3rdTiebreak = idx === 2 && thirdSetType === 'tiebreak';
    const maxVal = is3rdTiebreak ? 10 : 7;
    const v = Math.max(0, Math.min(maxVal, Number(val)));
    const newSets = [...sets];
    if (!newSets[idx]) newSets[idx] = { a: 0, b: 0 };
    const updated = { ...newSets[idx], [who]: v };
    newSets[idx] = updated;
    setSets(newSets);
    if (!is3rdTiebreak && !(updated.a === 6 && updated.b === 6)) {
      setTiebreaks(prev => ({ ...prev, [idx]: null }));
    }
  };

  const updateTiebreak = (idx, who, val) => {
    setTiebreaks(prev => ({
      ...prev,
      [idx]: { ...(prev[idx] || { a: 0, b: 0 }), [who]: Math.max(0, Number(val)) },
    }));
  };

  const validSets = sets.filter(s => s !== null);

  const setWinner = (s, idx) => {
    if (!s) return null;
    if (s.a === 6 && s.b === 6) {
      const tb = tiebreaks[idx];
      if (!tb) return null;
      if (tb.a >= 7 && tb.a - tb.b >= 2) return 'a';
      if (tb.b >= 7 && tb.b - tb.a >= 2) return 'b';
      return null;
    }
    if (s.a > s.b) return 'a';
    if (s.b > s.a) return 'b';
    return null;
  };

  const setsWonA = validSets.filter((s, i) => setWinner(s, i) === 'a').length;
  const setsWonB = validSets.filter((s, i) => setWinner(s, i) === 'b').length;
  const winnerSide = setsWonA > setsWonB ? 'a' : setsWonB > setsWonA ? 'b' : null;
  const winnerId = winnerSide === 'a' ? match.a : winnerSide === 'b' ? match.b : null;

  const w1 = setWinner(sets[0], 0);
  const w2 = setWinner(sets[1], 1);
  const firstTwoSplit = w1 && w2 && w1 !== w2;

  useEffect(() => {
    if (!firstTwoSplit && sets[2] !== null) {
      setSets(prev => { const n = [...prev]; n[2] = null; return n; });
    }
  }, [firstTwoSplit]);

  const resolvedSets = validSets.map((s, i) => {
    if (s.a === 6 && s.b === 6) {
      const w = setWinner(s, i);
      if (w === 'a') return { a: 7, b: 6 };
      if (w === 'b') return { a: 6, b: 7 };
    }
    return s;
  });

  const earned = winnerSide ? calcPoints(resolvedSets, winnerSide) : { a: 1, b: 1 };
  const myRole = match.a === myId ? 'a' : 'b';
  const myPts = myRole === 'a' ? earned.a : earned.b;
  const oppPts = myRole === 'a' ? earned.b : earned.a;
  const isStraightSets = validSets.length === 2 && winnerSide !== null;

  const scoreStr = validSets.map((s, idx) => {
    if (idx === 2 && thirdSetType === 'tiebreak') return `[${s.a}-${s.b}]`;
    if (s.a === 6 && s.b === 6) {
      const tb = tiebreaks[idx];
      return tb ? `7-6 (${Math.max(tb.a, tb.b)})` : '7-6';
    }
    return `${s.a}-${s.b}`;
  }).join(', ');

  const regularOpts  = [0,1,2,3,4,5,6,7];
  const tbOpts       = [0,1,2,3,4,5,6,7,8,9,10,11,12];
  const longTbOpts   = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];

  const nameA = playerA.name.split(' ')[0];
  const nameB = playerB.name.split(' ')[0];

  return (
    <ModalShell onClose={onClose}>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: C.clay }}>
        Report Score
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: 22, lineHeight: 1.1, color: C.ink }} className="mb-4">
        {nameA} vs {nameB}
      </div>

      {/* Player name headers */}
      <div className="grid mb-1" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px' }}>
        <div />
        <div className="text-center text-[11px] uppercase tracking-[0.12em] font-bold truncate" style={{ color: playerA.id === myId ? C.clay : C.inkMute }}>
          {nameA}{playerA.id === myId ? ' ★' : ''}
        </div>
        <div />
        <div className="text-center text-[11px] uppercase tracking-[0.12em] font-bold truncate" style={{ color: playerB.id === myId ? C.clay : C.inkMute }}>
          {nameB}{playerB.id === myId ? ' ★' : ''}
        </div>
        <div />
      </div>

      {/* Set rows */}
      <div className="space-y-2 mb-3">
        {sets.map((set, idx) => set === null ? null : (
          <div key={idx}>
            {/* Set score row */}
            <div className="grid items-center gap-1" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px' }}>
              {/* Label */}
              <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.inkMute }}>
                {idx === 2 && thirdSetType === 'tiebreak' ? 'TB' : `Set ${idx + 1}`}
              </div>
              {/* Player A score */}
              <ScoreDropdown
                value={set.a}
                onChange={v => updateSet(idx, 'a', v)}
                highlight={setWinner(set, idx) === 'a'}
                options={idx === 2 && thirdSetType === 'tiebreak' ? tbOpts : regularOpts}
              />
              {/* Dash */}
              <div className="text-center font-bold" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace', fontSize: 16 }}>–</div>
              {/* Player B score */}
              <ScoreDropdown
                value={set.b}
                onChange={v => updateSet(idx, 'b', v)}
                highlight={setWinner(set, idx) === 'b'}
                options={idx === 2 && thirdSetType === 'tiebreak' ? tbOpts : regularOpts}
              />
              {/* Remove 3rd set */}
              {idx === 2
                ? <button onClick={() => setSets(prev => { const n = [...prev]; n[2] = null; return n; })} style={{ color: C.inkMute, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={14} />
                  </button>
                : <div />
              }
            </div>

            {/* 6-6 in-set tiebreak */}
            {set.a === 6 && set.b === 6 && !(idx === 2 && thirdSetType === 'tiebreak') && (
              <div className="grid items-center gap-1 mt-1 px-1 py-2 rounded" style={{ gridTemplateColumns: '52px 1fr 28px 1fr 28px', background: `${C.clay}12`, border: `1px solid ${C.clay}30` }}>
                <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.clay }}>TB</div>
                <ScoreDropdown
                  value={tiebreaks[idx]?.a ?? 0}
                  onChange={v => updateTiebreak(idx, 'a', v)}
                  highlight={(() => { const tb = tiebreaks[idx]; return !!(tb && tb.a >= 7 && tb.a - tb.b >= 2); })()}
                  options={longTbOpts}
                />
                <div className="text-center font-bold" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace', fontSize: 16 }}>–</div>
                <ScoreDropdown
                  value={tiebreaks[idx]?.b ?? 0}
                  onChange={v => updateTiebreak(idx, 'b', v)}
                  highlight={(() => { const tb = tiebreaks[idx]; return !!(tb && tb.b >= 7 && tb.b - tb.a >= 2); })()}
                  options={longTbOpts}
                />
                <div />
              </div>
            )}

            {/* 3rd set type toggle */}
            {idx === 2 && (
              <div className="flex gap-1 mt-2">
                {[{ id: 'full', label: 'Full set' }, { id: 'tiebreak', label: '10-pt TB' }].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setThirdSetType(opt.id)}
                    className="flex-1 py-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold rounded"
                    style={{
                      background: thirdSetType === opt.id ? C.clay : 'transparent',
                      color: thirdSetType === opt.id ? 'white' : C.inkMute,
                      border: `1px solid ${thirdSetType === opt.id ? C.clay : C.line}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add 3rd set */}
      {sets[2] === null && firstTwoSplit && (
        <button
          onClick={() => setSets(prev => { const n = [...prev]; n[2] = { a: 0, b: 0 }; return n; })}
          className="w-full py-2.5 mb-3 text-[11px] uppercase tracking-[0.15em] font-semibold rounded"
          style={{ border: `1px dashed ${C.clay}`, color: C.clay }}
        >
          + Add 3rd set
        </button>
      )}

      {/* Points preview */}
      <div className="rounded-lg p-3 mb-4" style={{ background: C.parchmentWarm, border: `1px solid ${C.line}` }}>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2" style={{ color: C.inkMute }}>Points Earned</div>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-[10px] uppercase tracking-[0.1em] mb-1 truncate" style={{ color: C.inkMute }}>{nameA}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 24, color: winnerSide === 'a' ? C.clay : C.ink }}>+{earned.a}</div>
            {winnerSide === 'a' && <div className="text-[9px] font-bold mt-0.5" style={{ color: C.win }}>Winner</div>}
          </div>
          <div style={{ color: C.line, fontSize: 16, fontWeight: 300 }}>vs</div>
          <div className="text-center flex-1">
            <div className="text-[10px] uppercase tracking-[0.1em] mb-1 truncate" style={{ color: C.inkMute }}>{nameB}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 24, color: winnerSide === 'b' ? C.clay : C.ink }}>+{earned.b}</div>
            {winnerSide === 'b' && <div className="text-[9px] font-bold mt-0.5" style={{ color: C.win }}>Winner</div>}
          </div>
        </div>
        {isStraightSets && <div className="mt-2 text-center text-[10px] font-semibold" style={{ color: C.green }}>★ Straight sets bonus</div>}
        {!winnerSide && validSets.length > 0 && <div className="mt-2 text-center text-[10px]" style={{ color: C.clay }}>Enter scores to determine winner</div>}
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-3 text-[12px] font-semibold rounded uppercase tracking-[0.1em]" style={{ border: `1px solid ${C.line}`, color: C.inkMute }}>
          Cancel
        </button>
        <button
          onClick={() => { if (!winnerId) return; onSubmit({ matchId: match.id, winnerId, scoreStr, sets: resolvedSets }); }}
          className="flex-1 py-3 text-[12px] font-bold rounded uppercase tracking-[0.1em]"
          style={{ background: winnerId ? C.clay : C.line, color: 'white', cursor: winnerId ? 'pointer' : 'not-allowed' }}
        >
          Submit
        </button>
      </div>
    </ModalShell>
  );
}

function ScoreDropdown({ value, onChange, highlight, max = 7, options }) {
  const opts = options || Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="flex-1 flex justify-center">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 26,
          fontWeight: 700,
          color: highlight ? C.clay : C.ink,
          background: highlight ? `${C.optic}50` : 'white',
          border: `2px solid ${highlight ? C.clay : C.line}`,
          borderRadius: 10,
          padding: '10px 6px',
          width: '100%',
          textAlign: 'center',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          minHeight: 56,
        }}
      >
        {opts.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   MODAL SHELL
   ============================================================ */
function ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fade-in 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-5 pb-8"
        style={{
          background: C.parchment,
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          animation: 'slide-up 0.3s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: C.line }}
        />
        {children}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0.5; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
