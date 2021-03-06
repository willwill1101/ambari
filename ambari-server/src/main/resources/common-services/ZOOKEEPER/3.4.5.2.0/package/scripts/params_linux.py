"""
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Ambari Agent

"""
import status_params
import os

from resource_management.libraries.functions import format
from resource_management.libraries.functions.version import format_hdp_stack_version
from resource_management.libraries.functions.default import default
from resource_management.libraries.functions import get_kinit_path
from resource_management.libraries.script.script import Script

# server configurations
config = Script.get_config()
tmp_dir = Script.get_tmp_dir()

stack_version_unformatted = str(config['hostLevelParams']['stack_version'])
hdp_stack_version = format_hdp_stack_version(stack_version_unformatted)

stack_name = default("/hostLevelParams/stack_name", None)
current_version = default("/hostLevelParams/current_version", None)
component_directory = status_params.component_directory

# New Cluster Stack Version that is defined during the RESTART of a Rolling Upgrade
version = default("/commandParams/version", None)

# default parameters
zk_home = "/usr"
zk_bin = "/usr/lib/zookeeper/bin"
zk_cli_shell = "/usr/lib/zookeeper/bin/zkCli.sh"
config_dir = "/etc/zookeeper/conf"
zk_smoke_out = os.path.join(tmp_dir, "zkSmoke.out")

# hadoop parameters for 2.2+
if Script.is_hdp_stack_greater_or_equal("2.2"):
  zk_home = format("/usr/hdp/current/{component_directory}")
  zk_bin = format("/usr/hdp/current/{component_directory}/bin")
  zk_cli_shell = format("/usr/hdp/current/{component_directory}/bin/zkCli.sh")
  config_dir = status_params.config_dir


zk_user = config['configurations']['zookeeper-env']['zk_user']
hostname = config['hostname']
user_group = config['configurations']['cluster-env']['user_group']
zk_env_sh_template = config['configurations']['zookeeper-env']['content']

zk_log_dir = config['configurations']['zookeeper-env']['zk_log_dir']
zk_data_dir = config['configurations']['zoo.cfg']['dataDir']
zk_pid_dir = status_params.zk_pid_dir
zk_pid_file = status_params.zk_pid_file
zk_server_heapsize_value = default('configurations/zookeeper-env/zk_server_heapsize', "1024m")
zk_server_heapsize = format("-Xmx{zk_server_heapsize_value}")

client_port = default('/configurations/zoo.cfg/clientPort', None)

if 'zoo.cfg' in config['configurations']:
  zoo_cfg_properties_map = config['configurations']['zoo.cfg']
else:
  zoo_cfg_properties_map = {}
zoo_cfg_properties_map_length = len(zoo_cfg_properties_map)

zk_principal_name = default("/configurations/zookeeper-env/zookeeper_principal_name", "zookeeper@EXAMPLE.COM")
zk_principal = zk_principal_name.replace('_HOST',hostname.lower())

java64_home = config['hostLevelParams']['java_home']
java_version = int(config['hostLevelParams']['java_version'])

zookeeper_hosts = config['clusterHostInfo']['zookeeper_hosts']
zookeeper_hosts.sort()

zk_keytab_path = config['configurations']['zookeeper-env']['zookeeper_keytab_path']
zk_server_jaas_file = format("{config_dir}/zookeeper_jaas.conf")
zk_client_jaas_file = format("{config_dir}/zookeeper_client_jaas.conf")
security_enabled = config['configurations']['cluster-env']['security_enabled']

smoke_user_keytab = config['configurations']['cluster-env']['smokeuser_keytab']
smokeuser = config['configurations']['cluster-env']['smokeuser']
smokeuser_principal = config['configurations']['cluster-env']['smokeuser_principal_name']
kinit_path_local = get_kinit_path(default('/configurations/kerberos-env/executable_search_paths', None))

#log4j.properties
if ('zookeeper-log4j' in config['configurations']) and ('content' in config['configurations']['zookeeper-log4j']):
  log4j_props = config['configurations']['zookeeper-log4j']['content']
else:
  log4j_props = None
