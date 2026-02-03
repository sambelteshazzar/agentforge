import * as React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components for live preview scope
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Unified scope object for react-live previews.
 * Includes React, hooks, Lucide icons, and shadcn/ui components.
 */
export const livePreviewScope = {
  // React core
  React,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,

  // All Lucide icons
  ...LucideIcons,

  // shadcn/ui components
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Badge,
  Separator,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Progress,
  Switch,
  Checkbox,

  // Utility
  cn,
};

export type LivePreviewScope = typeof livePreviewScope;
