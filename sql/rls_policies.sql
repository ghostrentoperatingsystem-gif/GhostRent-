alter table users enable row level security;
create policy "Users can view their own profile" on users for select using (auth.uid() = id);
create policy "Users can update their own profile" on users for update using (auth.uid() = id);
create policy "Users can insert their own profile" on users for insert with check (auth.uid() = id);

alter table properties enable row level security;
create policy "Anyone can view available properties" on properties for select
  using (status = 'available' or user_id = auth.uid());
create policy "Users can insert their own properties" on properties for insert with check (auth.uid() = user_id);
create policy "Users can update their own properties" on properties for update using (auth.uid() = user_id);
create policy "Users can delete their own properties" on properties for delete using (auth.uid() = user_id);

alter table tenants enable row level security;
create policy "Anyone can view tenant listings" on tenants for select using (true);
create policy "Users can insert their own tenant listing" on tenants for insert with check (auth.uid() = user_id);
create policy "Users can update their own tenant listing" on tenants for update using (auth.uid() = user_id);
create policy "Users can delete their own tenant listing" on tenants for delete using (auth.uid() = user_id);

-- Payments: no client insert/update policy — server (service role) only,
-- after verifying with Paystack. See /api/verify-payment.
alter table payments enable row level security;
create policy "Users can view their own payments" on payments for select using (auth.uid() = user_id);

alter table notifications enable row level security;
create policy "Users can view their own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert their own notifications" on notifications for insert with check (auth.uid() = user_id);
create policy "Users can update their own notifications" on notifications for update using (auth.uid() = user_id);

alter table messages enable row level security;
create policy "Users can view messages they sent or received" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users can send messages as themselves" on messages for insert with check (auth.uid() = sender_id);

alter table reports enable row level security;
create policy "Users can insert reports" on reports for insert with check (auth.uid() = reported_by);
-- Reads restricted to admin routes using the service role — don't add a broad select policy here.
