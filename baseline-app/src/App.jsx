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
