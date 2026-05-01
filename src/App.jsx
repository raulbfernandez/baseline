import { useState, useEffect, useMemo } from 'react';
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
    showToast(`Challenge sent to ${find(players, opponentId).name}`);
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
      alt="Baseline"
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
      className="flex items-center gap-3 px-4 py-4"
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
          fontSize: rank <= 3 ? 24 : 20,
          color: rankColor,
          fontVariantNumeric: 'tabular-nums',
          width: 28,
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
        <div className="flex items-center gap-1 mb-0.5">
          <button
            onClick={onViewProfile}
            className="font-bold"
            style={{ fontSize: 15, color: C.ink, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: '"Fraunces", serif', wordBreak: 'break-word' }}
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
            <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 rounded" style={{ color: C.inkMute, border: `1px solid ${C.line}` }}>
              Pending
            </span>
          ) : (
            <button
              onClick={onChallenge}
              className="text-[10px] uppercase tracking-[0.12em] font-bold px-3 py-1.5 rounded"
              style={{ background: C.clay, color: 'white', letterSpacing: '0.1em' }}
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
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: `1px solid ${C.line}`,
          borderLeft: `3px solid ${won ? C.win : C.loss}`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: won ? C.win : C.loss }}>
              {won ? 'Win' : 'Loss'}
            </span>
            <span style={{ color: C.line }}>·</span>
            <span className="text-[11px]" style={{ color: C.inkMute }}>{fmtDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace', color: won ? C.win : C.loss }}>
              {won ? '+' : ''}{match.change}
            </span>
            <button
              onClick={() => onDelete()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '10px 8px', lineHeight: 1 }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Avatar name={opponent.name} size={40} />
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: C.ink }}>vs {opponent.name}</div>
            <div className="text-[11px]" style={{ color: C.inkMute }}>{match.location}</div>
          </div>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '0.05em' }}>
          {match.score}
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
function ProfileView({ me, myRank, matches, players, onChangePassword, onUpdateProfile, onDeleteMatch, isAdmin, onReset, onSignOut }) {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [ustaRating, setUstaRating] = useState(me.ustaRating || '');

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
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateProfile({ profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ ustaRating });
    setEditingProfile(false);
  };

  return (
    <div>
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
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded"
                  style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}
                >
                  <div
                    className="w-8 h-8 flex-shrink-0 rounded flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: won ? C.optic : 'transparent',
                      border: won ? 'none' : `1px solid ${C.clay}`,
                      color: won ? C.clayDeep : C.clay,
                    }}
                  >
                    {won ? 'W' : 'L'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{opponent?.name || 'Unknown'}</div>
                    <div className="text-[11px]" style={{ color: C.inkMute, fontFamily: '"JetBrains Mono", monospace' }}>
                      {m.score}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace', color: won ? C.win : C.loss }}>
                      {won ? '+' : ''}{m.change} pts
                    </div>
                    <div className="text-[10px]" style={{ color: C.inkMute }}>
                      {fmtDate(m.date)}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteMatch(m.id)}
                    title="Delete match"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMute, padding: '10px 8px', flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
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

  if (completed.length === 0) return (
    <div className="text-[12px] text-center py-4" style={{ color: C.inkMute }}>No matches played yet</div>
  );

  return (
    <div className="space-y-3">
      {completed.map(m => {
        const winner = find(players, m.winnerId);
        const loserId = m.a === m.winnerId ? m.b : m.a;
        const loser = find(players, loserId);
        if (!winner || !loser) return null;
        return (
          <div key={m.id} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
            <div className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.inkMute }}>{fmtDate(m.date)}</div>
            <div className="flex items-center gap-2">
              {/* Winner */}
              <button onClick={() => onViewProfile(winner)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                {winner.profileImage
                  ? <img src={winner.profileImage} alt={winner.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.win}` }} />
                  : <Avatar name={winner.name} size={48} />
                }
                <div className="text-left min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 14, fontFamily: '"Fraunces", serif', color: C.ink }}>{winner.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.win }}>Won</div>
                </div>
              </button>
              {/* Score */}
              <div className="flex-shrink-0 px-2 py-1 rounded-full" style={{ background: C.parchmentWarm }}>
                <div className="text-[10px] font-semibold" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.ink, whiteSpace: 'nowrap' }}>{m.score}</div>
              </div>
              {/* Loser */}
              <button onClick={() => onViewProfile(loser)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                <div className="text-right min-w-0">
                  <div className="font-semibold truncate" style={{ fontSize: 14, fontFamily: '"Fraunces", serif', color: C.ink }}>{loser.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] font-bold" style={{ color: C.loss }}>Lost</div>
                </div>
                {loser.profileImage
                  ? <img src={loser.profileImage} alt={loser.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.loss}` }} />
                  : <Avatar name={loser.name} size={48} />
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
            <div className="space-y-2">
              {[...playerMatches].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(m => {
                const won = m.winnerId === player.id;
                const oppId = m.a === player.id ? m.b : m.a;
                const opp = find(players, oppId);
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded" style={{ background: 'rgba(255,255,255,0.82)', border: `1px solid ${C.line}` }}>
                    <div
                      className="w-7 h-7 flex-shrink-0 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ background: won ? C.optic : 'transparent', border: won ? 'none' : `1px solid ${C.clay}`, color: won ? C.clayDeep : C.clay }}
                    >
                      {won ? 'W' : 'L'}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {opp?.profileImage
                        ? <img src={opp.profileImage} alt={opp.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        : <Avatar name={opp?.name || '?'} size={22} />
                      }
                      <span className="text-[12px] font-semibold truncate" style={{ color: C.ink }}>{opp?.name || 'Unknown'}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px]" style={{ fontFamily: '"JetBrains Mono", monospace', color: C.inkMute }}>{m.score}</div>
                      <div className="text-[10px]" style={{ color: C.inkMute }}>{fmtDate(m.date)}</div>
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
